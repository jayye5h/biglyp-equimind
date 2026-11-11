# Read-only check of seeded demo progress data (Ananya 8 days, Rohan 14, Meera 5)
import os, requests
from datetime import datetime, timezone
BASE = open('/app/frontend/.env').read().split('REACT_APP_BACKEND_URL=')[1].split()[0].rstrip('/')
for uid in ["stu-ananya", "stu-rohan", "stu-meera"]:
    t = requests.post(f"{BASE}/api/auth/demo-login", json={"user_id": uid}).json()
    tok = t.get("token") or t.get("access_token")
    h = {"Authorization": f"Bearer {tok}"}
    r = requests.get(f"{BASE}/api/reports", headers=h)
    print(uid, r.status_code)
    reps = r.json()
    if isinstance(reps, dict): reps = reps.get("reports", reps.get("items", []))
    for rep in reps[:3]:
        ca = rep.get("created_at")
        age = (datetime.now(timezone.utc) - datetime.fromisoformat(ca)).total_seconds() / 86400 if ca else None
        print("  ", rep.get("id"), ca, f"age={age:.2f}d" if age else "", "logged", rep.get("logged_days"), "ticks", len(rep.get("ticks") or []), "moods", rep.get("moods"), "path", rep.get("path"))
t = requests.post(f"{BASE}/api/auth/demo-login", json={"user_id": "cou-kavya"}).json()
print("counsellor keys", list(t.keys()))
