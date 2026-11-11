"""Seed demo progress: Ananya -> 8 days of check-ins (Day 9 pending, popup shows);
Rohan -> full 14 days (Week 1, Week 2 and Next Steps pages unlocked).
Run: cd /app/backend && python scripts/seed_demo_progress.py  (idempotent)"""
import asyncio
import os
import sys
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


def build(rows):
    ticks, moods, notes = [], {}, {}
    for d, (mood, done, stress, feeling) in enumerate(rows):
        ticks += [f"{i}-{d}" for i, v in enumerate(done) if v]
        moods[str(d)] = mood
        notes[str(d)] = {"stress": stress, "feeling": feeling}
    return {"ticks": ticks, "moods": moods, "daily_notes": notes, "logged_days": list(range(len(rows))),
            "tracker": {}, "reflections": {}}


async def main():
    db = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    now = datetime.now(timezone.utc)
    for uid, rows, age in (("stu-ananya", ANANYA, 8), ("stu-rohan", ROHAN, 14)):
        r = await db.reports.find_one({"user_id": uid}, {"_id": 0, "id": 1}, sort=[("created_at", -1)])
        if not r:
            print(f"{uid}: no report found - take a check-in first")
            continue
        created = (now - timedelta(days=age, hours=2)).isoformat()
        await db.reports.update_one({"id": r["id"]}, {"$set": {"created_at": created, **build(rows)}})
        print(f"{uid}: report {r['id']} -> {len(rows)} days logged, created_at {created}")


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
