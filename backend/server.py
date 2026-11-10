import asyncio
import os
import logging
import random
import re
import secrets
import uuid
from contextlib import suppress
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional, List, Any

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from content import SCALE, AREAS, SUBTHEMES, ITEMS, ACTIVITIES, ITEMS as BANK, DEMO_USERS, BODY_TABLE, SCRIPTS, AREA_BY_KEY  # noqa: E402
from scoring import pick_items, score_responses, priority_pages, build_plan, body_pattern  # noqa: E402
from narrative import write_narrative  # noqa: E402
from media_seed import SEED_MEDIA  # noqa: E402
from wellness import today_plan, all_reads  # noqa: E402

YT_RE = re.compile(r"^(?:https?://)?(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})|^([A-Za-z0-9_-]{11})$")

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

INDEXES: dict[str, list[IndexModel]] = {
    "users": [IndexModel([("id", ASCENDING)], name="id", unique=True)],
    "sessions": [IndexModel([("token", ASCENDING)], name="token", unique=True)],
    "assessments": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("user_id", ASCENDING), ("status", ASCENDING), ("completed_at", DESCENDING)], name="user_status"),
    ],
    "reports": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logging.getLogger(__name__).error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


app = FastAPI()
api = APIRouter(prefix="/api")
TICK_RE = re.compile(r"^[0-4]-([0-9]|1[0-3])$")


def now():
    return datetime.now(timezone.utc)


async def current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not signed in")
    sess = await db.sessions.find_one({"token": authorization[7:]}, {"_id": 0})
    if not sess:
        raise HTTPException(401, "Session expired")
    user = await db.users.find_one({"id": sess["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


async def student_user(user: dict = Depends(current_user)) -> dict:
    if user["role"] != "student":
        raise HTTPException(403, "Students only")
    return user


async def admin_user(user: dict = Depends(current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user


class LoginIn(BaseModel):
    user_id: str


class SubmitIn(BaseModel):
    responses: Dict[str, int]


class ProgressIn(BaseModel):
    ticks: Optional[List[str]] = None
    moods: Optional[Dict[str, int]] = None
    tracker: Optional[Dict[str, Any]] = None
    reflections: Optional[Dict[str, Any]] = None
    logged_days: Optional[List[int]] = None
    daily_notes: Optional[Dict[str, Any]] = None


@api.get("/")
async def root():
    return {"message": "EquiMind API"}


@api.get("/auth/demo-users")
async def demo_users():
    return [{k: u[k] for k in ("id", "role", "name", "program", "year", "level")} for u in DEMO_USERS]


@api.post("/auth/demo-login")
async def demo_login(body: LoginIn):
    user = await db.users.find_one({"id": body.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Unknown demo user")
    token = secrets.token_urlsafe(32)
    await db.sessions.insert_one({"token": token, "user_id": user["id"], "created_at": now().isoformat()})
    return {"token": token, "user": user}


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return user


@api.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        await db.sessions.delete_one({"token": authorization[7:]})
    return {"ok": True}


def _public_assessment(a: dict) -> dict:
    return {"id": a["id"], "kind": a["kind"], "scale": SCALE,
            "items": [{"id": i, "text": BANK[i]["text"], "area": BANK[i]["area"],
                       "area_name": AREA_BY_KEY[BANK[i]["area"]]["name"]} for i in a["items"]]}


@api.post("/assessments/start")
async def start_assessment(user: dict = Depends(student_user)):
    existing = await db.assessments.find_one({"user_id": user["id"], "status": "in_progress"}, {"_id": 0})
    if existing:
        return _public_assessment(existing)
    prev = await db.assessments.find_one({"user_id": user["id"], "status": "completed"}, {"_id": 0}, sort=[("completed_at", -1)])
    seed = random.randint(1, 10**9)
    kind = "first"
    if prev:
        days = (now() - datetime.fromisoformat(prev["completed_at"])).days
        if 28 <= days <= 35 and prev["kind"] != "day30":
            kind, items = "day30", prev["items"]
        elif days < 7:
            kind, items = "retake_excluding_previous", pick_items(seed, set(prev["items"]))
        else:
            kind, items = "retake", pick_items(seed, set())
    else:
        items = pick_items(seed, set())
    doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "seed": seed, "kind": kind, "items": items,
           "status": "in_progress", "created_at": now().isoformat(), "completed_at": None}
    await db.assessments.insert_one(doc)
    return _public_assessment(doc)


@api.post("/assessments/{aid}/submit")
async def submit_assessment(aid: str, body: SubmitIn, user: dict = Depends(student_user)):
    a = await db.assessments.find_one({"id": aid, "user_id": user["id"]}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Check-in not found")
    if a["status"] != "in_progress":
        raise HTTPException(400, "Already submitted")
    resp = body.responses
    if set(resp.keys()) != set(a["items"]) or any(v not in (0, 1, 2, 3, 4) for v in resp.values()):
        raise HTTPException(422, "Please answer all 24 questions with a value from 0 to 4")
    locked = await db.assessments.find_one_and_update({"id": aid, "status": "in_progress"}, {"$set": {"status": "submitting"}})
    if not locked:
        raise HTTPException(400, "Already submitted")
    result = score_responses(a["items"], resp)
    pages = priority_pages(result, a["items"], resp)
    first = user["name"].split()[0]
    narr = await write_narrative(first, result)
    prev = await db.reports.find_one({"user_id": user["id"]}, {"_id": 0, "areas": 1, "overall": 1, "created_at": 1}, sort=[("created_at", -1)])
    report = {
        "id": str(uuid.uuid4()), "assessment_id": aid, "user_id": user["id"], "created_at": now().isoformat(),
        "kind": a["kind"], "version": "EquiMind v4.0",
        "student": {k: user[k] for k in ("name", "program", "level", "year", "institution", "student_code")},
        **result, "narrative": narr, "priority_pages": pages, "plan": build_plan(pages),
        "body_pattern": body_pattern(result), "previous": prev,
        "ticks": [], "moods": {}, "tracker": {}, "reflections": {},
    }
    await db.reports.insert_one(report)
    await db.assessments.update_one({"id": aid}, {"$set": {"status": "completed", "completed_at": now().isoformat(), "responses": resp}})
    report.pop("_id", None)
    return report


@api.get("/reports")
async def list_reports(user: dict = Depends(student_user)):
    rows = await db.reports.find({"user_id": user["id"]}, {"_id": 0, "id": 1, "created_at": 1, "overall": 1, "path": 1,
                                                           "areas": 1, "priorities": 1, "ticks": 1, "kind": 1}).sort("created_at", -1).to_list(100)
    return rows


@api.get("/reports/{rid}")
async def get_report(rid: str, user: dict = Depends(student_user)):
    r = await db.reports.find_one({"id": rid, "user_id": user["id"]}, {"_id": 0})
    if not r:
        raise HTTPException(404, "Report not found")
    r["body_table"] = BODY_TABLE
    r["scripts"] = SCRIPTS
    return r


@api.patch("/reports/{rid}/progress")
async def update_progress(rid: str, body: ProgressIn, user: dict = Depends(student_user)):
    upd = body.model_dump(exclude_none=True)
    if body.moods is not None and any(v not in (0, 1, 2, 3, 4) or not k.isdigit() or not 0 <= int(k) <= 13 for k, v in body.moods.items()):
        raise HTTPException(422, "Mood must be 0-4 for days 0-13")
    if body.logged_days is not None and any(d < 0 or d > 13 for d in body.logged_days):
        raise HTTPException(422, "Logged days must be 0-13")
    if body.logged_days is not None:
        upd["logged_days"] = sorted(set(body.logged_days))
    if body.ticks is not None and any(not TICK_RE.match(t) for t in body.ticks):
        raise HTTPException(422, "Invalid tick")
    if body.ticks is not None:
        upd["ticks"] = list(dict.fromkeys(body.ticks))
    if body.ticks is not None and len(body.ticks) > 70:
        raise HTTPException(422, "Too many ticks")
    if len(str(body.tracker or "")) + len(str(body.reflections or "")) + len(str(body.daily_notes or "")) > 20000:
        raise HTTPException(422, "Entries are too long")
    if not upd:
        raise HTTPException(400, "Nothing to update")
    res = await db.reports.update_one({"id": rid, "user_id": user["id"]}, {"$set": upd})
    if not res.matched_count:
        raise HTTPException(404, "Report not found")
    return {"ok": True}


async def _latest_report(user_id: str):
    return await db.reports.find_one({"user_id": user_id}, {"_id": 0, "created_at": 1, "moods": 1, "priorities": 1}, sort=[("created_at", -1)])


@api.get("/wellness/today")
async def wellness_today(user: dict = Depends(student_user)):
    return today_plan(await _latest_report(user["id"]))


@api.get("/wellness/reads")
async def wellness_reads(user: dict = Depends(student_user)):
    return all_reads(await _latest_report(user["id"]))


class MediaIn(BaseModel):
    kind: str
    title: str
    duration: str = ""
    url: str


def _media_doc(body: MediaIn) -> dict:
    if body.kind not in ("short", "audiobook", "video"):
        raise HTTPException(422, "Kind must be short, audiobook or video")
    m = YT_RE.search(body.url.strip())
    if not m:
        raise HTTPException(422, "Please paste a valid YouTube link")
    if not body.title.strip():
        raise HTTPException(422, "Title is required")
    return {"kind": body.kind, "title": body.title.strip()[:80], "duration": body.duration.strip()[:20], "youtube_id": m.group(1) or m.group(2)}


@api.get("/media")
async def list_media(_: dict = Depends(current_user)):
    return await db.media.find({}, {"_id": 0}).sort("order", 1).to_list(500)


@api.post("/admin/media")
async def add_media(body: MediaIn, _: dict = Depends(admin_user)):
    last = await db.media.find_one({}, {"_id": 0, "order": 1}, sort=[("order", -1)])
    doc = {"id": str(uuid.uuid4()), **_media_doc(body), "order": (last["order"] + 1) if last else 0}
    await db.media.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/admin/media/{mid}")
async def update_media(mid: str, body: MediaIn, _: dict = Depends(admin_user)):
    res = await db.media.update_one({"id": mid}, {"$set": _media_doc(body)})
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    return await db.media.find_one({"id": mid}, {"_id": 0})


@api.delete("/admin/media/{mid}")
async def delete_media(mid: str, _: dict = Depends(admin_user)):
    res = await db.media.delete_one({"id": mid})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(admin_user)):
    rows = await db.reports.find({}, {"_id": 0, "areas": 1, "overall": 1, "path": 1, "user_id": 1, "priorities": 1}).sort("created_at", -1).to_list(5000)
    total = len(rows)
    latest = {}
    for r in rows:
        latest.setdefault(r["user_id"], r)
    reports = list(latest.values())
    n = students = len(reports)
    min_cohort = 3
    if students < min_cohort:
        return {"total_checkins": None, "students": None, "min_cohort": min_cohort, "suppressed": True}
    avg = {a["key"]: round(sum(next(x["score"] for x in r["areas"] if x["key"] == a["key"]) for r in reports) / n) for a in AREAS}
    pri = {a["key"]: sum(1 for r in reports if a["key"] in r["priorities"]) for a in AREAS}
    return {"total_checkins": total, "students": students, "min_cohort": min_cohort, "suppressed": False,
            "avg_overall": round(sum(r["overall"] for r in reports) / n),
            "path_split": {"strengthening": sum(1 for r in reports if r["path"] == 1), "counsellor": sum(1 for r in reports if r["path"] == 2)},
            "areas": [{"key": a["key"], "name": a["name"], "short": a["short"], "avg": avg[a["key"]], "priority_count": pri[a["key"]]} for a in AREAS]}


@api.get("/admin/items")
async def admin_items(_: dict = Depends(admin_user)):
    return {"areas": AREAS, "subthemes": list(SUBTHEMES.values()), "items": list(ITEMS.values())}


@api.get("/admin/activities")
async def admin_activities(_: dict = Depends(admin_user)):
    return [{**act, "area": k, "area_name": AREA_BY_KEY[k]["name"]} for k, acts in ACTIVITIES.items() for act in acts]


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


async def seed_users():
    for u in DEMO_USERS:
        await db.users.update_one({"id": u["id"]}, {"$set": u}, upsert=True)
    if not await db.media.count_documents({}):
        await db.media.insert_many([{"id": str(uuid.uuid4()), "kind": k, "title": t, "duration": d, "youtube_id": y, "order": i}
                                    for i, (k, t, d, y) in enumerate(SEED_MEDIA)])


@app.on_event("startup")
async def startup():
    app.state.index_task = asyncio.create_task(ensure_indexes())
    await seed_users()


@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
