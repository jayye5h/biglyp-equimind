"""Seed prefilled assessment and progress report data into MongoDB.

Seeds 8 complete demo profiles:
- Position 1 in every stage: 14-Day Showcase Profile (Days 1–14 complete, Stage 14, 47+ ticks)
- Position 2 in every stage: 7-Day Showcase Profile  (Days 1–7 complete, Stage 7, 24+ ticks)

Can target local MongoDB or MongoDB Atlas by passing --url or setting MONGO_URL.

Usage:
    python seed_demo_data.py
    python seed_demo_data.py --url "mongodb+srv://..." --db biglyp_equimind
"""
import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from pymongo import MongoClient

FOURTEEN_DAY_USERS = {"stu-ananya", "mm-diya", "me-arjun", "fe-aarav"}
SEVEN_DAY_USERS = {"stu-rohan", "mm-aarav", "me-riya", "fe-meher"}


def find_file(filename: str) -> Path:
    candidates = [
        Path(filename),
        Path("backend") / filename,
        Path(__file__).parent / filename,
        Path(__file__).parent.parent / filename,
    ]
    for c in candidates:
        if c.is_file():
            return c
    raise FileNotFoundError(f"Could not locate {filename} in {candidates}")


def main():
    parser = argparse.ArgumentParser(description="Seed demo assessments and reports into MongoDB")
    parser.add_argument("--url", default=None, help="MongoDB connection string (defaults to MONGO_URL env or localhost:27017)")
    parser.add_argument("--db", default=None, help="Database name (defaults to DB_NAME env or biglyp_equimind)")
    args = parser.parse_args()

    # Load from environment or fallback
    mongo_url = args.url or os.environ.get("MONGO_URL") or "mongodb://localhost:27017"
    db_name = args.db or os.environ.get("DB_NAME") or "biglyp_equimind"

    # Locate JSON files
    assessments_path = find_file("assessments.json")
    reports_path = find_file("reports.json")

    print(f"Loading assessments from: {assessments_path}")
    with open(assessments_path, "r", encoding="utf-8") as f:
        assessments = json.load(f)

    print(f"Loading reports from:     {reports_path}")
    with open(reports_path, "r", encoding="utf-8") as f:
        reports = json.load(f)

    print(f"\nConnecting to MongoDB ({db_name})...")
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]

    # Test connection
    try:
        client.admin.command("ping")
        print(" Connected to MongoDB successfully!")
    except Exception as e:
        print(f" Connection failed: {e}")
        print("\nIf connecting locally, make sure your local MongoDB service is running on port 27017.")
        print("If connecting to Atlas, pass --url 'mongodb+srv://user:pass@cluster.mongodb.net/'")
        sys.exit(1)

    all_user_ids = list(FOURTEEN_DAY_USERS | SEVEN_DAY_USERS)

    # 1. Clean up existing assessments and reports for these 8 demo users
    db.assessments.delete_many({"user_id": {"$in": all_user_ids}})
    db.reports.delete_many({"user_id": {"$in": all_user_ids}})
    print(f"Cleaned up previous test records for {len(all_user_ids)} demo profiles.")

    # Calculate dynamic timestamps aligned with TODAY
    now_dt = datetime.now(timezone.utc)
    created_14d = (now_dt - timedelta(days=13, hours=2)).isoformat()
    assess_14d = (now_dt - timedelta(days=13, hours=3)).isoformat()

    created_7d = (now_dt - timedelta(days=6, hours=10)).isoformat()
    assess_7d = (now_dt - timedelta(days=6, hours=11)).isoformat()

    print("\nAligning journey timelines with current date:")
    print(f"  14-Day Showcase start: {created_14d} (13 days ago -> Active: Day 14 of 14)")
    print(f"  7-Day Showcase start:  {created_7d} (6.5 days ago -> Active: Day 7 of 14)")

    # 2. Insert assessments
    print(f"\nSeeding {len(assessments)} assessments...")
    for a in assessments:
        doc = dict(a)
        uid = doc.get("user_id")
        if uid in FOURTEEN_DAY_USERS:
            doc["created_at"] = assess_14d
            doc["completed_at"] = created_14d
        elif uid in SEVEN_DAY_USERS:
            doc["created_at"] = assess_7d
            doc["completed_at"] = created_7d
        db.assessments.insert_one(doc)
        print(f"  Created assessment for {uid} ({doc.get('programme')})")

    # 3. Insert reports
    print(f"\nSeeding {len(reports)} reports...")
    for r in reports:
        doc = dict(r)
        uid = doc.get("user_id")
        student_name = doc.get("student", {}).get("name", uid)
        prog = doc.get("programme")

        if uid in FOURTEEN_DAY_USERS:
            doc["created_at"] = created_14d
            journey_type = "14-Day Showcase (Day 14 of 14, 14 days logged, Stage 14)"
        elif uid in SEVEN_DAY_USERS:
            doc["created_at"] = created_7d
            journey_type = "7-Day Showcase (Day 7 of 14, 7 days logged, Stage 7)"
        else:
            journey_type = "Standard"

        ticks_count = len(doc.get("ticks", []))
        logged_days_count = len(doc.get("logged_days", []))
        moods_count = len(doc.get("moods", {}))
        db.reports.insert_one(doc)

        print(f"  [{prog.upper():10}] {student_name:14} ({uid}): {journey_type}")
        print(f"               Overall: {doc.get('overall')}% | Ticks: {ticks_count} | Days Logged: {logged_days_count} | Moods: {moods_count}")

    print("\n Demo data seeded successfully!")
    print("In every stage:")
    print("  Position #1: 14-Day profile (complete)")
    print("  Position #2: 7-Day profile (mid-journey)")


if __name__ == "__main__":
    main()
