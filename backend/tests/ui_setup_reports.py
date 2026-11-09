# Helper: create rohan reports & backdate (args: list of hours-ago). Prints ids. `cleanup` arg deletes ids in /tmp/ui_ids.txt
import os, sys, random, json, requests
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

env = dict(l.strip().split("=", 1) for l in open("/app/backend/.env") if "=" in l)
db = MongoClient(env["MONGO_URL"].strip('"'))[env["DB_NAME"].strip('"')]
fe = dict(l.strip().split("=", 1) for l in open("/app/frontend/.env") if "=" in l)
API = fe["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"

if sys.argv[1] == "cleanup":
    for line in open("/tmp/ui_ids.txt"):
        rid, aid = line.split()
        print(db.reports.delete_one({"id": rid}).deleted_count, db.assessments.delete_one({"id": aid}).deleted_count)
    sys.exit()

if sys.argv[1] == "set":
    db.reports.update_one({"id": sys.argv[2]}, {"$set": json.loads(sys.argv[3])}); sys.exit()

tok = requests.post(f"{API}/auth/demo-login", json={"user_id": "stu-rohan"}).json()["token"]
h = {"Authorization": f"Bearer {tok}"}
for hrs in sys.argv[1:]:
    a = requests.post(f"{API}/assessments/start", headers=h).json()
    r = requests.post(f"{API}/assessments/{a['id']}/submit", headers=h, json={"responses": {i["id"]: random.randint(0, 4) for i in a["items"]}}, timeout=90).json()
    ts = (datetime.now(timezone.utc) - timedelta(hours=float(hrs))).isoformat()
    db.reports.update_one({"id": r["id"]}, {"$set": {"created_at": ts}})
    open("/tmp/ui_ids.txt", "a").write(f"{r['id']} {a['id']}\n")
    print(hrs, r["id"], [p["short"] for p in r["plan"]])
