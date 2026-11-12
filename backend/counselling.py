"""Counsellor slots, student bookings/requests, counsellor portal and attention flags."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from plan_theory import enrich_plan, next_activities
import notify
import programmes

IST = ZoneInfo("Asia/Kolkata")
MOOD = ["Struggling", "Rough", "Mixed", "Steady", "Strong"]
STATUSES = ("pending", "confirmed", "completed", "cancelled")


def _now():
    return datetime.now(timezone.utc)


def elapsed_days(r):
    return int((_now() - datetime.fromisoformat(r["created_at"])).total_seconds() // 86400)


def attention_flags(r):
    """Return (severity 0-2, reasons) for a student's latest report."""
    if not r:
        return 0, []
    flags, sev = [], 0
    if r.get("path") == 2:
        flags.append("Assessment recommends counsellor support")
        sev = 2
    low = [a for a in r.get("areas", []) if a["score"] < 35]
    for a in low:
        flags.append(f"Needs care first: {a['name']} ({a['score']})")
        sev = 2
    if r.get("overall", 100) < 50:
        flags.append(f"Low overall score ({r['overall']})")
        sev = max(sev, 1)
    watch = [a for a in r.get("areas", []) if 35 <= a["score"] < 50]
    if len(watch) >= 2:
        flags.append(f"{len(watch)} areas on watch")
        sev = max(sev, 1)
    e = elapsed_days(r)
    moods = r.get("moods") or {}
    recent = [moods[str(d)] for d in range(max(0, min(e, 13) - 2), min(e, 13) + 1) if moods.get(str(d)) is not None]
    if recent and sum(recent) / len(recent) <= 1:
        flags.append(f"Low mood in recent check-ins ({', '.join(MOOD[m] for m in recent)})")
        sev = 2
    notes = r.get("daily_notes") or {}
    for d in range(max(0, min(e, 13) - 2), min(e, 13) + 1):
        n = notes.get(str(d)) or {}
        if isinstance(n.get("stress"), (int, float)) and n["stress"] >= 8:
            flags.append(f"High stress {n['stress']}/10 on Day {d + 1}")
            sev = max(sev, 1)
            break
    fb = r.get("feedback") or {}
    lo = max(0, min(e, 13) - 2)
    worse = [int(k) + 1 for k, v in fb.items() if k.isdigit() and int(k) >= lo and (v or {}).get("feel") == "worse"]
    if worse:
        flags.append(f"Felt worse after activities (Day {', '.join(map(str, sorted(worse)))})")
        sev = max(sev, 1)
    logged = set(r.get("logged_days") or [])
    if 3 <= e <= 15 and not any(d in logged for d in range(min(e, 13) - 2, min(e, 13) + 1)):
        flags.append("No daily check-ins in the last 3 days")
        sev = max(sev, 1)
    return sev, flags


def summary(r):
    if not r:
        return None
    e = elapsed_days(r)
    return {"id": r["id"], "created_at": r["created_at"], "overall": r.get("overall"), "path": r.get("path"),
            "areas": [{k: a[k] for k in ("key", "name", "short", "score", "level")} for a in r.get("areas", [])],
            "day": min(max(e, 0), 13) + 1, "journey_over": e > 13, "logged": len(r.get("logged_days") or []),
            "ticks": len(r.get("ticks") or [])}


class SlotsIn(BaseModel):
    starts: list[str] = Field(..., min_length=1, max_length=40)
    minutes: int = Field(30, ge=15, le=120)
    mode: str = Field("In person · Wellness Centre", max_length=80)


class BookIn(BaseModel):
    slot_id: Optional[str] = None
    note: str = Field("", max_length=600)
    preferred: str = Field("", max_length=120)


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    counsellor_note: Optional[str] = Field(None, max_length=1000)
    slot_id: Optional[str] = None


def build_router(db, current_user, student_user):
    r = APIRouter()

    async def counsellor_user(user: dict = Depends(current_user)) -> dict:
        if user["role"] != "counsellor":
            raise HTTPException(403, "Counsellors only")
        return user

    async def latest(uid):
        return await db.reports.find_one({"user_id": uid}, {"_id": 0}, sort=[("created_at", -1)])

    async def booking_out(b):
        slot = await db.slots.find_one({"id": b.get("slot_id")}, {"_id": 0}) if b.get("slot_id") else None
        c = await db.users.find_one({"id": b.get("counsellor_id")}, {"_id": 0, "name": 1})
        return {**b, "slot": slot, "counsellor_name": (c or {}).get("name")}

    # ------------------------------------------------ student side
    @r.get("/counselling/slots")
    async def open_slots(user: dict = Depends(student_user)):
        rows = await db.slots.find({"booked_by": None, "removed": {"$ne": True}, "start": {"$gt": _now().isoformat()}}, {"_id": 0}).sort("start", 1).to_list(200)
        names = {u["id"]: u["name"] for u in await db.users.find({"role": "counsellor", "programme": programmes.peer_q(user)}, {"_id": 0, "id": 1, "name": 1}).to_list(50)}
        return [{**s, "counsellor_name": names[s["counsellor_id"]]} for s in rows if s["counsellor_id"] in names]

    @r.get("/counselling/my")
    async def my_bookings(user: dict = Depends(student_user)):
        rows = await db.bookings.find({"student_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
        return [await booking_out(b) for b in rows]

    @r.post("/counselling/bookings")
    async def book(body: BookIn, user: dict = Depends(student_user)):
        active = await db.bookings.count_documents({"student_id": user["id"], "status": {"$in": ["pending", "confirmed"]}})
        if active >= 2:
            raise HTTPException(409, "You already have an upcoming session or request")
        bid = str(uuid.uuid4())
        counsellor_id = None
        if body.slot_id:
            allowed = [c["id"] for c in await db.users.find({"role": "counsellor", "programme": programmes.peer_q(user)}, {"_id": 0, "id": 1}).to_list(50)]
            slot = await db.slots.find_one_and_update({"id": body.slot_id, "counsellor_id": {"$in": allowed}, "booked_by": None, "removed": {"$ne": True}, "start": {"$gt": _now().isoformat()}},
                                                      {"$set": {"booked_by": user["id"], "booking_id": bid}}, projection={"_id": 0})
            if not slot:
                raise HTTPException(409, "Sorry, that slot was just taken. Please pick another time.")
            counsellor_id = slot["counsellor_id"]
        else:
            c = await db.users.find_one({"role": "counsellor", "programme": programmes.peer_q(user)}, {"_id": 0, "id": 1})
            counsellor_id = (c or {}).get("id")
        rep = await latest(user["id"])
        doc = {"id": bid, "student_id": user["id"], "counsellor_id": counsellor_id, "slot_id": body.slot_id,
               "kind": "slot" if body.slot_id else "request", "status": "confirmed" if body.slot_id else "pending",
               "note": body.note.strip(), "preferred": body.preferred.strip(), "report_id": (rep or {}).get("id"),
               "counsellor_note": "", "created_at": _now().isoformat()}
        await db.bookings.insert_one(dict(doc))
        notify.fire(notify.booking_event("session_booked", doc))
        return await booking_out(doc)

    @r.post("/counselling/bookings/{bid}/cancel")
    async def cancel(bid: str, user: dict = Depends(student_user)):
        b = await db.bookings.find_one_and_update({"id": bid, "student_id": user["id"], "status": {"$in": ["pending", "confirmed"]}},
                                                 {"$set": {"status": "cancelled"}}, projection={"_id": 0})
        if not b:
            raise HTTPException(404, "Booking not found")
        notify.fire(notify.booking_event("session_cancelled", {**b, "status": "cancelled"}, by="student"))
        if b.get("slot_id"):
            await db.slots.update_one({"id": b["slot_id"]}, {"$set": {"booked_by": None, "booking_id": None}})
        return {"ok": True}

    # ------------------------------------------------ counsellor side
    @r.get("/counsellor/slots")
    async def my_slots(user: dict = Depends(counsellor_user)):
        since = (_now() - timedelta(days=1)).isoformat()
        rows = await db.slots.find({"counsellor_id": user["id"], "removed": {"$ne": True}, "start": {"$gt": since}}, {"_id": 0}).sort("start", 1).to_list(300)
        names = {u["id"]: u["name"] for u in await db.users.find({"role": "student"}, {"_id": 0, "id": 1, "name": 1}).to_list(500)}
        return [{**s, "student_name": names.get(s.get("booked_by"))} for s in rows]

    @r.post("/counsellor/slots")
    async def add_slots(body: SlotsIn, user: dict = Depends(counsellor_user)):
        out = []
        for st in body.starts:
            try:
                dt = datetime.fromisoformat(st)
            except ValueError:
                raise HTTPException(422, f"Invalid time: {st}")
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=IST)
            if dt <= _now():
                raise HTTPException(422, "Slots must be in the future")
            iso = dt.astimezone(timezone.utc).isoformat()
            if await db.slots.find_one({"counsellor_id": user["id"], "start": iso, "removed": {"$ne": True}}):
                continue
            s = {"id": str(uuid.uuid4()), "counsellor_id": user["id"], "start": iso, "minutes": body.minutes,
                 "mode": body.mode, "booked_by": None, "booking_id": None}
            await db.slots.insert_one(dict(s))
            out.append(s)
        return out

    @r.delete("/counsellor/slots/{sid}")
    async def del_slot(sid: str, user: dict = Depends(counsellor_user)):
        res = await db.slots.update_one({"id": sid, "counsellor_id": user["id"], "booked_by": None, "removed": {"$ne": True}}, {"$set": {"removed": True}})
        if not res.modified_count:
            raise HTTPException(409, "Only free slots can be removed")
        return {"ok": True}

    async def student_row(u, bookings_by):
        rep = await latest(u["id"])
        sev, flags = attention_flags(rep)
        bs = bookings_by.get(u["id"], [])
        return {"student": {k: u.get(k) for k in ("id", "name", "program", "year", "level", "student_code")},
                "report": summary(rep), "severity": sev, "flags": flags,
                "active_booking": next((b["status"] for b in bs if b["status"] in ("pending", "confirmed")), None)}

    @r.get("/counsellor/students")
    async def students(user: dict = Depends(counsellor_user)):
        us = await db.users.find({"role": "student", "programme": programmes.peer_q(user)}, {"_id": 0}).to_list(1000)
        bookings_by = {}
        for b in await db.bookings.find({}, {"_id": 0, "student_id": 1, "status": 1}).to_list(5000):
            bookings_by.setdefault(b["student_id"], []).append(b)
        rows = [await student_row(u, bookings_by) for u in us]
        rows.sort(key=lambda x: (-x["severity"], x["report"]["overall"] if x["report"] else 101))
        return rows

    @r.get("/counsellor/sessions")
    async def sessions(user: dict = Depends(counsellor_user)):
        mine = [u["id"] for u in await db.users.find({"role": "student", "programme": programmes.peer_q(user)}, {"_id": 0, "id": 1}).to_list(5000)]
        rows = await db.bookings.find({"student_id": {"$in": mine}}, {"_id": 0}).sort("created_at", -1).to_list(500)
        out = []
        for b in rows:
            u = await db.users.find_one({"id": b["student_id"]}, {"_id": 0, "id": 1, "name": 1, "program": 1, "year": 1, "student_code": 1})
            rep = await latest(b["student_id"])
            sev, flags = attention_flags(rep)
            out.append({**(await booking_out(b)), "student": u, "report": summary(rep), "severity": sev, "flags": flags})
        return out

    @r.patch("/counsellor/bookings/{bid}")
    async def update_booking(bid: str, body: BookingUpdate, user: dict = Depends(counsellor_user)):
        b = await db.bookings.find_one({"id": bid}, {"_id": 0})
        stu = await db.users.find_one({"id": (b or {}).get("student_id")}, {"_id": 0, "programme": 1}) if b else None
        if not b or (stu or {}).get("programme", "equimind") not in programmes.peers(user.get("programme")):
            raise HTTPException(404, "Booking not found")
        upd = {}
        if body.counsellor_note is not None:
            upd["counsellor_note"] = body.counsellor_note.strip()
        if body.slot_id and body.slot_id != b.get("slot_id"):
            slot = await db.slots.find_one_and_update({"id": body.slot_id, "counsellor_id": user["id"], "booked_by": None, "removed": {"$ne": True}},
                                                      {"$set": {"booked_by": b["student_id"], "booking_id": bid}}, projection={"_id": 0})
            if not slot:
                raise HTTPException(409, "That slot is not available")
            if b.get("slot_id"):
                await db.slots.update_one({"id": b["slot_id"]}, {"$set": {"booked_by": None, "booking_id": None}})
            upd.update({"slot_id": body.slot_id, "status": "confirmed", "counsellor_id": user["id"]})
        if body.status:
            if body.status not in STATUSES:
                raise HTTPException(422, "Invalid status")
            if body.status in ("confirmed", "completed") and not (upd.get("slot_id") or b.get("slot_id")):
                raise HTTPException(422, "Pick a slot for this request first")
            upd["status"] = body.status
            if body.status == "cancelled" and b.get("slot_id"):
                await db.slots.update_one({"id": b["slot_id"]}, {"$set": {"booked_by": None, "booking_id": None}})
        if not upd:
            raise HTTPException(400, "Nothing to update")
        await db.bookings.update_one({"id": bid}, {"$set": upd})
        nb = {**b, **upd}
        if upd.get("status") == "cancelled" and b.get("status") != "cancelled":
            notify.fire(notify.booking_event("session_cancelled", nb, by="counsellor"))
        elif nb.get("status") == "confirmed" and (upd.get("slot_id") or b.get("status") != "confirmed"):
            notify.fire(notify.booking_event("session_booked", nb))
        return await booking_out(nb)

    @r.get("/counsellor/students/{uid}")
    async def student_detail(uid: str, user: dict = Depends(counsellor_user)):
        u = await db.users.find_one({"id": uid, "role": "student", "programme": programmes.peer_q(user)}, {"_id": 0})
        if not u:
            raise HTTPException(404, "Student not found")
        rep = await latest(uid)
        sev, flags = attention_flags(rep)
        if rep:
            C = programmes.get(rep.get("programme"))
            rep["plan"] = enrich_plan(rep.get("plan", []), C)
            rep["next_activities"] = next_activities(rep, C=C)
        reports = await db.reports.find({"user_id": uid}, {"_id": 0, "id": 1, "created_at": 1, "overall": 1}).sort("created_at", -1).to_list(50)
        bs = await db.bookings.find({"student_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(50)
        return {"student": u, "report": rep, "reports": reports, "severity": sev, "flags": flags,
                "bookings": [await booking_out(b) for b in bs]}

    return r, counsellor_user


async def seed_slots(db, counsellor_id):
    """Keep ~5 days of demo availability (11:00, 14:30, 16:00 IST on weekdays)."""
    if await db.slots.count_documents({"counsellor_id": counsellor_id, "start": {"$gt": _now().isoformat()}}) >= 4:
        return
    day = datetime.now(IST).date()
    added = 0
    while added < 5:
        day += timedelta(days=1)
        if day.weekday() == 6:
            continue
        for h, m in ((11, 0), (14, 30), (16, 0)):
            iso = datetime(day.year, day.month, day.day, h, m, tzinfo=IST).astimezone(timezone.utc).isoformat()
            if not await db.slots.find_one({"counsellor_id": counsellor_id, "start": iso}):
                await db.slots.insert_one({"id": str(uuid.uuid4()), "counsellor_id": counsellor_id, "start": iso, "minutes": 30,
                                           "mode": "In person · Wellness Centre" if h != 16 else "Online video call",
                                           "booked_by": None, "booking_id": None})
        added += 1
