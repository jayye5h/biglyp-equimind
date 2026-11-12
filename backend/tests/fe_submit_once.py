# One-off: submit a full FocusEdge check-in for fe-vihaan and validate the generated report (creates 1 report)
import os, re, random, time, requests
B = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
tok = requests.post(f"{B}/api/auth/demo-login", json={"user_id": "fe-vihaan"}).json()["token"]
s = requests.Session(); s.headers["Authorization"] = f"Bearer {tok}"
a = s.post(f"{B}/api/assessments/start").json()
print("kind", a["kind"], "n", len(a["items"]))
rng = random.Random(7)
resp = {i["id"]: (4 if i["area"] in ("D1", "D3") else rng.randint(0, 3)) for i in a["items"]}
t = time.time()
r = s.post(f"{B}/api/assessments/{a['id']}/submit", json={"responses": resp}, timeout=120)
print("status", r.status_code, "secs", round(time.time() - t, 1))
d = r.json()
print("areas", [x["key"] for x in d["areas"]])
print("overall", d["overall"], "mean", round(sum(x["score"] for x in d["areas"]) / 10))
print("priorities", d["priorities"], "path", d["path"], "body_page", d["body_page"])
print("plan", [p["id"] for p in d["plan"]])
print("pp", [(p["area"], bool(p["theory"]), [x["id"] for x in p["activities"]]) for p in d["priority_pages"]])
n = str(d["narrative"])
print("clinical hits", re.findall(r"\b(ADHD|ADD|disorder|diagnos\w*|symptom\w*|condition)\b", n, re.I))
print("narrative", n[:900])
print("report id", d["id"])
again = s.post(f"{B}/api/assessments/{a['id']}/submit", json={"responses": resp})
print("resubmit", again.status_code, again.text[:100])
