"""Notification module: 7 notifications x 3 channels (email via Resend, SMS demo-log, in-app + web push).
Admin switches each channel per notification (`notification_settings`). Every attempt is written to
`notification_log` (status: sent | demo | off | no_contact | not_connected | failed)."""
import asyncio
import html
import hmac
import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import resend
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from pywebpush import WebPushException

log = logging.getLogger("notify")
CHANNELS = ("email", "sms", "app")
EVENTS = [
    {"id": "checkin_reminder", "name": "Daily check-in reminder", "audience": "Students",
     "when": "10 am, 4 pm and 8 pm (IST) while today's daily check-in is still pending"},
    {"id": "session_booked", "name": "Counselling session booked", "audience": "Student + counsellor",
     "when": "A student books a slot or sends a request, or the counsellor confirms or moves it"},
    {"id": "session_cancelled", "name": "Counselling session cancelled", "audience": "Student + counsellor",
     "when": "The student or the counsellor cancels a session"},
    {"id": "session_reminder", "name": "Session reminder", "audience": "Student + counsellor",
     "when": "About 1 hour before a confirmed counselling session"},
    {"id": "week1_unlocked", "name": "Week 1 progress unlocked", "audience": "Students",
     "when": "Day 7 of the 14-day plan, when the Week 1 Progress page opens in the report"},
    {"id": "week2_unlocked", "name": "Week 2 progress unlocked", "audience": "Students",
     "when": "Day 14, when Week 2 Progress and Your Next Steps open in the report"},
    {"id": "low_mood_alert", "name": "Low-mood alert to counsellor", "audience": "Counsellors",
     "when": "A student's recent daily moods average Rough or lower"},
]
EVENT_BY_ID = {e["id"]: e for e in EVENTS}
SAMPLE_CONTACTS = {
    "stu-ananya": ("ananya.rao@demo-university.edu", "+91 98450 11001"),
    "stu-rohan": ("rohan.verma@demo-university.edu", "+91 98450 11002"),
    "stu-meera": ("meera.iyer@demo-university.edu", "+91 98450 11003"),
    "cou-kavya": ("kavya.menon@demo-university.edu", "+91 98450 22001"),
    "adm-platform": ("admin@biglyp.com", "+91 98450 33001"),
}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+?[0-9][0-9 \-]{7,18}$")
IST = timezone(timedelta(hours=5, minutes=30))
_db = None


def init(db):
    global _db
    _db = db


_tasks = set()


def fire(coro):
    """Run a notification coroutine in the background without blocking the request."""
    async def _safe():
        try:
            await coro
        except Exception as exc:  # noqa: BLE001
            log.warning("notification failed: %s", exc)
    t = asyncio.create_task(_safe())
    _tasks.add(t)
    t.add_done_callback(_tasks.discard)


def _now():
    return datetime.now(timezone.utc)


def email_connected():
    return bool(os.environ.get("RESEND_API_KEY"))


def fmt_time(iso):
    try:
        return datetime.fromisoformat(iso).astimezone(IST).strftime("%a %d %b, %I:%M %p IST").replace(" 0", " ")
    except Exception:  # noqa: BLE001
        return iso or ""


async def channel_settings(event):
    doc = await _db.notification_settings.find_one({"id": event}, {"_id": 0}) or {}
    return {c: doc.get(c, True) for c in CHANNELS}


async def seed_contacts(db):
    for uid, (email, phone) in SAMPLE_CONTACTS.items():
        await db.users.update_one({"id": uid, "contact_email": {"$exists": False}}, {"$set": {"contact_email": email, "phone": phone}})


async def _push(uid, payload):
    from push_notify import _send  # local import: push_notify imports this module
    sent = 0
    async for sub in _db.push_subs.find({"user_id": uid}, {"_id": 0}):
        try:
            await asyncio.to_thread(_send, sub, payload)
            sent += 1
        except WebPushException as exc:
            if getattr(exc.response, "status_code", None) in (404, 410):
                await _db.push_subs.delete_one({"endpoint": sub["endpoint"]})
        except Exception as exc:  # noqa: BLE001
            log.warning("push error for %s: %s", uid, exc)
    return sent


def _email_html(name, title, body, url):
    base = os.environ.get("APP_BASE_URL", "").rstrip("/")
    link = f'<p style="margin:24px 0"><a href="{html.escape(base + url)}" style="background:#2f6bd8;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none">Open EquiMind</a></p>' if base else ""
    return (f'<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1e293b">'
            f'<p style="color:#2f6bd8;font-weight:bold">EquiMind</p><p>Hi {html.escape(name.split(" ")[0])},</p>'
            f'<h2 style="font-size:20px">{html.escape(title)}</h2><p style="line-height:1.6">{html.escape(body)}</p>{link}'
            f'<p style="font-size:12px;color:#64748b">You get this because notifications are switched on for your campus wellbeing programme.</p></div>')


async def _send_email(to, name, title, body, url, idem):
    if not email_connected():
        return "not_connected", None
    resend.api_key = os.environ["RESEND_API_KEY"]
    params = {"from": os.environ.get("RESEND_FROM") or "EquiMind <onboarding@resend.dev>", "to": [to], "subject": title,
              "text": f"{body}", "html": _email_html(name, title, body, url)}
    try:
        res = await resend.Emails.send_async(params, {"idempotency_key": idem[:256]})
        return "sent", (res or {}).get("id")
    except Exception as exc:  # noqa: BLE001  (ResendError and network errors)
        log.warning("email failed: %s", exc)
        return "failed", str(getattr(exc, "message", exc))[:200]


async def send(event, user_id, title, body, url="/", key=None, test=False):
    """Deliver one notification to one user on every channel the admin has switched on. Idempotent per key."""
    if key and await _db.notification_log.find_one({"key": key}, {"_id": 1}):
        return {"duplicate": True}
    user = await _db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {}
    on = await channel_settings(event)
    batch = key or str(uuid.uuid4())
    out = {}
    for ch in CHANNELS:
        to, detail = None, None
        if not on[ch]:
            status = "off"
        elif ch == "app":
            to = "In-app + browser"
            await _db.notifications.insert_one({"id": str(uuid.uuid4()), "key": f"{batch}:app", "user_id": user_id, "event": event, "title": title,
                                                "body": body, "url": url, "read": False, "created_at": _now().isoformat()})
            pushed = await _push(user_id, {"title": title, "body": body, "url": url, "tag": f"eq-{event}"})
            status, detail = "sent", f"in-app inbox · pushed to {pushed} device{'s' if pushed != 1 else ''}"
        elif ch == "email":
            to = user.get("contact_email")
            status, detail = ("no_contact", None) if not to else await _send_email(to, user["name"], title, body, url, f"{batch}:email")
        else:
            to = user.get("phone")
            status = "no_contact" if not to else "demo"
            detail = "Demo mode — logged, not sent" if to else None
        out[ch] = status
        await _db.notification_log.insert_one({"id": str(uuid.uuid4()), "key": key, "batch": batch, "event": event,
                                               "user_id": user_id, "user_name": user["name"], "role": user.get("role"), "channel": ch, "to": to,
                                               "status": status, "detail": detail, "title": title, "body": body, "test": test,
                                               "created_at": _now().isoformat()})
    return out


# ------------------------------------------------------------------ event helpers used by other modules
async def booking_event(event, booking, by=None):
    slot = await _db.slots.find_one({"id": booking.get("slot_id")}, {"_id": 0}) if booking.get("slot_id") else None
    stu = await _db.users.find_one({"id": booking["student_id"]}, {"_id": 0, "name": 1}) or {}
    cou = await _db.users.find_one({"id": booking.get("counsellor_id")}, {"_id": 0, "name": 1}) or {}
    when = fmt_time(slot["start"]) if slot else "a time to be confirmed"
    sname, cname = stu.get("name", "A student"), cou.get("name", "your counsellor")
    tag = f"{event}:{booking['id']}:{booking.get('slot_id') or 'req'}:{booking.get('status')}"
    if event == "session_booked":
        if booking.get("kind") == "request" and booking.get("status") == "pending":
            st = ("Session request sent", f"Your request to talk with {cname} has been sent. They'll confirm a time soon.")
            ct = ("New session request", f"{sname} has asked for a counselling session. Pick a slot to confirm it.")
        else:
            st = ("Counselling session booked", f"Your session with {cname} is booked for {when}.")
            ct = ("Session booked", f"{sname} has a session with you on {when}.")
        await send(event, booking["student_id"], *st, url="/dashboard", key=f"{tag}:s")
        if booking.get("counsellor_id"):
            await send(event, booking["counsellor_id"], *ct, url="/counsellor", key=f"{tag}:c")
    elif event == "session_cancelled":
        who = "You" if by == "student" else cname
        await send(event, booking["student_id"], "Counselling session cancelled",
                   f"{who} cancelled the session planned for {when}. You can book another time whenever you're ready.", url="/dashboard", key=f"{tag}:s")
        if booking.get("counsellor_id"):
            await send(event, booking["counsellor_id"], "Session cancelled",
                       f"The session with {sname} on {when} was cancelled{' by the student' if by == 'student' else ''}.", url="/counsellor", key=f"{tag}:c")


async def maybe_low_mood(report):
    from counselling import attention_flags  # local import to avoid a cycle
    _, flags = attention_flags(report)
    flag = next((f for f in flags if f.startswith("Low mood")), None)
    if not flag:
        return
    stu = await _db.users.find_one({"id": report["user_id"]}, {"_id": 0, "name": 1}) or {}
    date = datetime.now(IST).date().isoformat()
    async for c in _db.users.find({"role": "counsellor"}, {"_id": 0, "id": 1}):
        await send("low_mood_alert", c["id"], f"Low mood: {stu.get('name', 'a student')}",
                   f"{stu.get('name', 'A student')} has logged low moods in recent check-ins ({flag.split('(')[-1].rstrip(')')}). A gentle check-in may help.",
                   url=f"/counsellor/student/{report['user_id']}", key=f"low_mood:{report['user_id']}:{c['id']}:{date}")


async def sweep():
    """Session reminders (~1h before) + Week 1 / Week 2 unlock notices. Safe to run often (idempotent keys)."""
    now = _now()
    n = 0
    async for b in _db.bookings.find({"status": "confirmed", "slot_id": {"$ne": None}}, {"_id": 0}):
        slot = await _db.slots.find_one({"id": b["slot_id"]}, {"_id": 0})
        if not slot:
            continue
        mins = (datetime.fromisoformat(slot["start"]) - now).total_seconds() / 60
        if not 0 < mins <= 65:
            continue
        when = fmt_time(slot["start"])
        stu = await _db.users.find_one({"id": b["student_id"]}, {"_id": 0, "name": 1}) or {}
        cou = await _db.users.find_one({"id": b.get("counsellor_id")}, {"_id": 0, "name": 1}) or {}
        await send("session_reminder", b["student_id"], "Your session is in about an hour",
                   f"Your counselling session with {cou.get('name', 'your counsellor')} starts at {when}.", url="/dashboard", key=f"remind:{b['id']}:{slot['id']}:s")
        if b.get("counsellor_id"):
            await send("session_reminder", b["counsellor_id"], "Session in about an hour",
                       f"Your session with {stu.get('name', 'a student')} starts at {when}.", url="/counsellor", key=f"remind:{b['id']}:{slot['id']}:c")
        n += 1
    async for u in _db.users.find({"role": "student"}, {"_id": 0, "id": 1}):
        r = await _db.reports.find_one({"user_id": u["id"]}, {"_id": 0, "id": 1, "created_at": 1}, sort=[("created_at", -1)])
        if not r:
            continue
        e = int((now - datetime.fromisoformat(r["created_at"])).total_seconds() // 86400)
        if e >= 7:
            await send("week1_unlocked", u["id"], "Your Week 1 progress is ready",
                       "You've reached Day 7. Open your report to see how your first week went.", url=f"/report/{r['id']}#week-1", key=f"week1:{r['id']}")
        if e >= 14:
            await send("week2_unlocked", u["id"], "Your Week 2 progress and next steps are ready",
                       "You've completed the 14-day plan. See your Week 2 progress and what to do next.", url=f"/report/{r['id']}#week-2", key=f"week2:{r['id']}")
    return n


# ------------------------------------------------------------------ routes
class ChannelsIn(BaseModel):
    email: Optional[bool] = None
    sms: Optional[bool] = None
    app: Optional[bool] = None


class ContactIn(BaseModel):
    email: str = ""
    phone: str = ""


SAMPLES = {
    "checkin_reminder": ("Time for your daily check-in 🌿", "Day 5: a quick 30-second check-in keeps your 14-day plan on track."),
    "session_booked": ("Counselling session booked", "Your session with Dr. Kavya Menon is booked for Thu 12 Nov, 11:00 AM IST."),
    "session_cancelled": ("Counselling session cancelled", "The session planned for Thu 12 Nov, 11:00 AM IST was cancelled. You can book another time whenever you're ready."),
    "session_reminder": ("Your session is in about an hour", "Your counselling session with Dr. Kavya Menon starts at 11:00 AM IST."),
    "week1_unlocked": ("Your Week 1 progress is ready", "You've reached Day 7. Open your report to see how your first week went."),
    "week2_unlocked": ("Your Week 2 progress and next steps are ready", "You've completed the 14-day plan. See your Week 2 progress and what to do next."),
    "low_mood_alert": ("Low mood: Meera Iyer", "Meera Iyer has logged low moods in recent check-ins (Rough, Struggling). A gentle check-in may help."),
}


def build_router(db, current_user, admin_user):
    r = APIRouter()

    @r.get("/me/contact")
    async def get_contact(user: dict = Depends(current_user)):
        return {"email": user.get("contact_email") or "", "phone": user.get("phone") or ""}

    @r.put("/me/contact")
    async def put_contact(body: ContactIn, user: dict = Depends(current_user)):
        email, phone = body.email.strip(), body.phone.strip()
        if email and not EMAIL_RE.match(email):
            raise HTTPException(422, "Please enter a valid email address")
        if phone and not PHONE_RE.match(phone):
            raise HTTPException(422, "Please enter a valid phone number, e.g. +91 98450 12345")
        await db.users.update_one({"id": user["id"]}, {"$set": {"contact_email": email, "phone": phone}})
        return {"email": email, "phone": phone}

    @r.post("/notifications/read-all")
    async def read_all(user: dict = Depends(current_user)):
        await db.notifications.update_many({"user_id": user["id"], "read": False}, {"$set": {"read": True}})
        return {"ok": True}

    @r.get("/admin/notifications")
    async def admin_list(_: dict = Depends(admin_user)):
        rows = []
        for e in EVENTS:
            last = await db.notification_log.find_one({"event": e["id"], "status": {"$ne": "off"}}, {"_id": 0, "created_at": 1}, sort=[("created_at", -1)])
            rows.append({**e, "channels": await channel_settings(e["id"]), "last_sent": (last or {}).get("created_at")})
        return {"events": rows, "providers": {
            "email": {"provider": "Resend", "connected": email_connected(), "from": os.environ.get("RESEND_FROM") or "EquiMind <onboarding@resend.dev>"},
            "sms": {"provider": "Demo", "connected": False, "mode": "demo"},
            "app": {"provider": "In-app inbox + browser push", "connected": True, "devices": await db.push_subs.count_documents({})},
        }}

    @r.put("/admin/notifications/{eid}")
    async def admin_set(eid: str, body: ChannelsIn, _: dict = Depends(admin_user)):
        if eid not in EVENT_BY_ID:
            raise HTTPException(404, "Notification not found")
        upd = body.model_dump(exclude_none=True)
        if not upd:
            raise HTTPException(400, "Nothing to update")
        await db.notification_settings.update_one({"id": eid}, {"$set": {"id": eid, **upd}}, upsert=True)
        return {"id": eid, "channels": await channel_settings(eid)}

    @r.post("/admin/notifications/{eid}/test")
    async def admin_test(eid: str, user: dict = Depends(admin_user)):
        if eid not in EVENT_BY_ID:
            raise HTTPException(404, "Notification not found")
        title, body = SAMPLES[eid]
        return {"result": await send(eid, user["id"], f"[Test] {title}", body, url="/admin", test=True)}

    @r.get("/admin/notifications/log")
    async def admin_log(event: Optional[str] = None, channel: Optional[str] = None, limit: int = 100, _: dict = Depends(admin_user)):
        q = {}
        if event:
            q["event"] = event
        if channel:
            q["channel"] = channel
        return await db.notification_log.find(q, {"_id": 0, "key": 0}).sort("created_at", -1).to_list(min(max(limit, 1), 300))

    @r.post("/cron/notify-sweep")
    async def cron_sweep(request: Request, tasks: BackgroundTasks, authorization: Optional[str] = Header(None),
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
        run_id = x_webhook_id or (env or {}).get("run_id") or _now().isoformat()
        res = await db.cron_runs.update_one({"run_id": run_id}, {"$setOnInsert": {"run_id": run_id, "kind": "sweep", "at": _now().isoformat()}}, upsert=True)
        if res.upserted_id is None:
            return {"ok": True, "duplicate": True}
        tasks.add_task(sweep)
        return {"ok": True, "accepted": run_id}

    return r
