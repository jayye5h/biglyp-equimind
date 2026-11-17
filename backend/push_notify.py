"""Web push (VAPID) subscriptions + 3x daily check-in reminders triggered by platform cron."""
import asyncio
import hmac
import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request
from pydantic import BaseModel
try:
    from pywebpush import WebPushException, webpush
except ImportError:
    class WebPushException(Exception):
        pass
    def webpush(*args, **kwargs):
        pass

import notify

IST = ZoneInfo("Asia/Kolkata")
log = logging.getLogger("push")

MESSAGES = {
    "morning": ("Good morning 🌿", "Your daily check-in is ready. Two minutes for you — how are you feeling today?"),
    "afternoon": ("A gentle nudge 🌤️", "You still have time for today's small habits. Open EquiMind and log how it's going."),
    "evening": ("Before the day ends 🌙", "Take a calm minute to finish today's check-in — every step keeps your journey growing."),
}


def slot_now():
    h = datetime.now(IST).hour
    return "morning" if h < 13 else "afternoon" if h < 18 else "evening"


def pending_today(r):
    """Same rule as the app: today's day index (0-13) if not yet logged, else None."""
    if not r:
        return None
    e = int((datetime.now(timezone.utc) - datetime.fromisoformat(r["created_at"])).total_seconds() // 86400)
    if e < 0 or e > 15:
        return None
    d = min(e, 13)
    return None if d in (r.get("logged_days") or []) else d


class SubIn(BaseModel):
    endpoint: str
    keys: dict
    expirationTime: Optional[float] = None


def _send(sub, payload):
    webpush(subscription_info={"endpoint": sub["endpoint"], "keys": sub["keys"]}, data=json.dumps(payload),
            vapid_private_key=os.environ["VAPID_PRIVATE_KEY"], vapid_claims={"sub": os.environ["VAPID_SUBJECT"]}, ttl=4 * 3600)


def build_router(db, current_user, student_user):
    r = APIRouter()

    async def push_user(uid, payload):
        sent = 0
        async for sub in db.push_subs.find({"user_id": uid}, {"_id": 0}):
            try:
                await asyncio.to_thread(_send, sub, payload)
                sent += 1
            except WebPushException as exc:
                code = getattr(exc.response, "status_code", None)
                if code in (404, 410):
                    await db.push_subs.delete_one({"endpoint": sub["endpoint"]})
                log.warning("push failed for %s: %s", uid, code)
            except Exception as exc:  # noqa: BLE001
                log.warning("push error for %s: %s", uid, exc)
        return sent

    async def run_reminders(run_id, slot):
        date = datetime.now(IST).date().isoformat()
        title, body = MESSAGES[slot]
        n = 0
        async for u in db.users.find({"role": "student"}, {"_id": 0, "id": 1}):
            rep = await db.reports.find_one({"user_id": u["id"]}, {"_id": 0, "created_at": 1, "logged_days": 1}, sort=[("created_at", -1)])
            day = pending_today(rep)
            if day is None:
                continue
            key = f"{u['id']}:{date}:{slot}"
            if await db.notifications.find_one({"key": key}):
                continue
            res = await notify.send("checkin_reminder", u["id"], title, f"Day {day + 1}: {body}", url="/dashboard", key=f"checkin:{key}")
            n += 1 if res.get("app") == "sent" else 0
        await db.cron_runs.update_one({"run_id": run_id}, {"$set": {"done": True, "pushed": n}})
        log.info("reminders %s (%s): pushed %s", run_id, slot, n)

    @r.get("/push/public-key")
    async def public_key():
        return {"publicKey": os.environ["VAPID_PUBLIC_KEY"]}

    @r.post("/push/subscribe")
    async def subscribe(body: SubIn, user: dict = Depends(current_user)):
        if not body.endpoint.startswith("https://"):
            raise HTTPException(422, "Invalid subscription")
        await db.push_subs.update_one({"endpoint": body.endpoint},
                                      {"$set": {"endpoint": body.endpoint, "keys": body.keys, "user_id": user["id"],
                                                "updated_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        return {"ok": True}

    @r.post("/push/unsubscribe")
    async def unsubscribe(body: SubIn, user: dict = Depends(current_user)):
        await db.push_subs.delete_one({"endpoint": body.endpoint, "user_id": user["id"]})
        return {"ok": True}

    @r.get("/push/status")
    async def status(user: dict = Depends(current_user)):
        return {"subscribed": await db.push_subs.count_documents({"user_id": user["id"]}) > 0}

    @r.post("/push/test")
    async def test(user: dict = Depends(student_user)):
        sent = await push_user(user["id"], {"title": "Reminders are on 🌿", "body": "We'll nudge you at 10 am, 4 pm and 8 pm until your daily check-in is done.", "url": "/dashboard", "tag": "eq-test"})
        return {"sent": sent}

    @r.get("/notifications")
    async def my_notifications(user: dict = Depends(current_user)):
        return await db.notifications.find({"user_id": user["id"]}, {"_id": 0, "key": 0, "run_id": 0}).sort("created_at", -1).to_list(20)

    @r.post("/cron/reminders")
    async def cron_reminders(request: Request, tasks: BackgroundTasks, authorization: Optional[str] = Header(None),
                             x_webhook_id: Optional[str] = Header(None)):
        # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
        secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
        if not secret or not authorization or not authorization.startswith("Bearer ") or not hmac.compare_digest(authorization[7:], secret):
            raise HTTPException(401, "Unauthorized")
        try:
            env = await request.json()
        except Exception:  # noqa: BLE001
            env = {}
        if env is not None and not isinstance(env, dict):
            raise HTTPException(400, "Invalid body")
        run_id = x_webhook_id or (env or {}).get("run_id") or datetime.now(timezone.utc).isoformat()
        res = await db.cron_runs.update_one({"run_id": run_id}, {"$setOnInsert": {"run_id": run_id, "at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        if res.upserted_id is None:
            return {"ok": True, "duplicate": True}
        tasks.add_task(run_reminders, run_id, slot_now())
        return {"ok": True, "accepted": run_id}

    return r
