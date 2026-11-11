"""Seed demo progress: Ananya -> 8 days of check-ins (Day 9 pending, popup shows);
Rohan -> full 14 days (Week 1, Week 2 and Next Steps pages unlocked);
Meera -> 5 struggling days (Day 6 pending) so she appears in the counsellor's "Needs attention" list.
Run: cd /app/backend && python scripts/seed_demo_progress.py  (idempotent)"""
import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# per day: (mood 0-4, which of the 5 activities were done, stress 0-10, feeling)
ANANYA = [
    (1, [1, 1, 0, 0, 0], 8, "anxious"),
    (1, [1, 0, 1, 0, 0], 7, "tired"),
    (2, [1, 1, 1, 0, 0], 7, "unsure"),
    (2, [1, 1, 0, 1, 0], 6, "hopeful"),
    (1, [1, 0, 0, 0, 1], 7, "stressed"),
    (2, [1, 1, 1, 0, 1], 5, "calmer"),
    (3, [1, 1, 1, 1, 0], 5, "lighter"),
    (3, [1, 1, 1, 0, 1], 4, "steady"),
]
ROHAN = [
    (2, [1, 1, 0, 1, 0], 6, "restless"),
    (2, [1, 1, 1, 0, 0], 6, "okay"),
    (1, [1, 0, 1, 0, 0], 7, "drained"),
    (2, [1, 1, 1, 1, 0], 6, "better"),
    (3, [1, 1, 1, 1, 1], 5, "focused"),
    (2, [1, 1, 0, 1, 1], 5, "mixed"),
    (3, [1, 1, 1, 0, 1], 4, "calm"),
    (3, [1, 1, 1, 1, 1], 4, "motivated"),
    (3, [1, 1, 1, 1, 0], 4, "steady"),
    (4, [1, 1, 1, 1, 1], 3, "happy"),
    (3, [1, 1, 1, 1, 1], 3, "confident"),
    (4, [1, 1, 1, 0, 1], 3, "energetic"),
    (4, [1, 1, 1, 1, 1], 2, "proud"),
    (4, [1, 1, 1, 1, 1], 2, "ready"),
]


MEERA = [
    (1, [1, 0, 0, 0, 0], 8, "overwhelmed"),
    (0, [0, 1, 0, 0, 0], 9, "hopeless"),
    (1, [1, 0, 1, 0, 0], 8, "tired"),
    (0, [0, 0, 0, 0, 0], 9, "numb"),
    (0, [1, 0, 0, 0, 0], 9, "alone"),
]
FEEDBACK = {
    "good": [("a_lot", "better", "The breathing really calmed me down."), ("a_little", "better", "Felt a bit lighter after."),
             ("a_lot", "better", ""), ("a_little", "same", "Busy day, but it helped a little.")],
    "low": [("a_little", "same", "Hard to focus today."), ("not_really", "worse", "I couldn't get myself to do much."),
            ("not_really", "same", ""), ("not_really", "worse", "Everything feels too heavy right now.")],
}


def build(rows, plan=()):
    # one-off activities ("once this fortnight") are ticked only on the first day they were done
    once = {i for i, p in enumerate(plan) if "once this" in (p.get("time") or "")}
    used = set()
    ticks, moods, notes, feedback = [], {}, {}, {}
    for d, (mood, done, stress, feeling) in enumerate(rows):
        for i, v in enumerate(done):
            if v and not (i in once and i in used):
                ticks.append(f"{i}-{d}")
                used.add(i)
        moods[str(d)] = mood
        notes[str(d)] = {"stress": stress, "feeling": feeling}
        if any(done):
            h, f, c = FEEDBACK["low" if mood <= 1 else "good"][d % 4]
            feedback[str(d)] = {"helpful": h, "feel": f, "comment": c}
    return {"ticks": ticks, "moods": moods, "daily_notes": notes, "feedback": feedback, "logged_days": list(range(len(rows))),
            "tracker": {}, "reflections": {}}


async def main():
    db = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    now = datetime.now(timezone.utc)
    for uid, rows, age in (("stu-ananya", ANANYA, 8), ("stu-rohan", ROHAN, 14), ("stu-meera", MEERA, 5)):
        r = await db.reports.find_one({"user_id": uid}, {"_id": 0, "id": 1, "plan": 1}, sort=[("created_at", -1)])
        if not r:
            print(f"{uid}: no report found - take a check-in first")
            continue
        created = (now - timedelta(days=age, hours=2)).isoformat()
        await db.reports.update_one({"id": r["id"]}, {"$set": {"created_at": created, **build(rows, r.get("plan") or [])}})
        print(f"{uid}: report {r['id']} -> {len(rows)} days logged, created_at {created}")
    # Ananya books a counselling slot (if she has no active booking)
    if not await db.bookings.find_one({"student_id": "stu-ananya", "status": {"$in": ["pending", "confirmed"]}}):
        slot = await db.slots.find_one({"booked_by": None, "removed": {"$ne": True}, "start": {"$gt": now.isoformat()}}, sort=[("start", 1)])
        rep = await db.reports.find_one({"user_id": "stu-ananya"}, {"_id": 0, "id": 1}, sort=[("created_at", -1)])
        if slot and rep:
            bid = str(uuid.uuid4())
            await db.slots.update_one({"id": slot["id"]}, {"$set": {"booked_by": "stu-ananya", "booking_id": bid}})
            await db.bookings.insert_one({"id": bid, "student_id": "stu-ananya", "counsellor_id": slot["counsellor_id"], "slot_id": slot["id"],
                                          "kind": "slot", "status": "confirmed", "note": "Exams are piling up and I've been very stressed this week. I'd like to talk about managing it.",
                                          "preferred": "", "report_id": rep["id"], "counsellor_note": "", "created_at": now.isoformat()})
            print("stu-ananya: booked slot", slot["start"])


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
