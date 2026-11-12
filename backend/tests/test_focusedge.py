# FocusEdge programme (Grades 6-8) tests: demo users, check-in bank, report, wellness, games, media, admin, counsellors
import os
import re
from collections import Counter
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
FE_KEYS = [f"D{i}" for i in range(1, 11)]
CLINICAL = re.compile(r"\b(ADHD|ADD|disorder|diagnos\w*)\b", re.I)
FE_GAMES = ["memory", "simon", "odd-colour", "sudoku", "pattern-recall", "slide-puzzle", "count-shapes", "quick-sums", "breath-balloon"]


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200, r.text
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s, r.json()["user"]


@pytest.fixture(scope="module")
def admin():
    return login("adm-platform")[0]


@pytest.fixture(scope="module")
def aarav():
    return login("fe-aarav")[0]


# --- demo users ordering
def test_demo_users_fe():
    users = requests.get(f"{BASE_URL}/api/auth/demo-users").json()
    ids = {u["id"]: u for u in users}
    for i in ("fe-aarav", "fe-meher", "fe-vihaan"):
        assert ids[i]["programme"] == "focusedge"
        assert ids[i]["role"] == "student"


# --- existing report for aarav
def test_aarav_report(aarav):
    reps = aarav.get(f"{BASE_URL}/api/reports").json()
    assert reps, "aarav has no reports"
    r = aarav.get(f"{BASE_URL}/api/reports/{reps[0]['id']}").json()
    assert r["programme"] == "focusedge"
    assert [a["key"] for a in r["areas"]] == FE_KEYS
    assert r["overall"] == round(sum(a["score"] for a in r["areas"]) / 10)
    assert len(r["priorities"]) == 3
    assert len(r["plan"]) == 5 and r["plan"][0]["id"] == "fe-wake"
    assert all(p["id"].startswith("fe-") for p in r["plan"])
    assert len(r["priority_pages"]) == 3
    for p in r["priority_pages"]:
        assert p["theory"] and len(p["activities"]) == 2
    narr = str(r["narrative"])
    assert not CLINICAL.search(narr), CLINICAL.findall(narr)
    print("scripts:", [x.get("to") for x in r["scripts"]], "body rows:", [b if isinstance(b, str) else list(b.values())[0] for b in r["body_table"]][:10])


# --- check-in start + wrong submit (no full submit to avoid creating extra reports)
def test_checkin_start_and_bad_submit():
    s, _ = login("fe-vihaan")
    d = s.post(f"{BASE_URL}/api/assessments/start").json()
    items = d["items"]
    assert len(items) == 40
    assert all(re.match(r"^D\d+\.\d-\d\d$", i["id"]) for i in items), [i["id"] for i in items][:5]
    sub = Counter(i["id"].split("-")[0] for i in items)
    assert len(sub) == 40 and all(v == 1 for v in sub.values())
    c = Counter(i["area"] for i in items)
    assert set(c) == set(FE_KEYS) and all(v == 4 for v in c.values())
    assert all(items[j]["area"] != items[j + 1]["area"] for j in range(39))
    r = s.post(f"{BASE_URL}/api/assessments/{d['id']}/submit", json={"responses": {items[0]["id"]: 2}})
    assert r.status_code == 422 and "40" in r.text


# --- wellness
def test_wellness_today_fe(aarav):
    d = aarav.get(f"{BASE_URL}/api/wellness/today").json()
    txt = str(d)
    print(str(d)[:800])
    assert "Attention & Focus" in txt or any(k in txt for k in ("Focus", "Study"))
    assert "Academic Stress" not in txt


def test_wellness_reads_fe(aarav):
    d = aarav.get(f"{BASE_URL}/api/wellness/reads").json()
    reads = d if isinstance(d, list) else d.get("reads", d.get("items", []))
    print(type(d), len(reads))
    assert len(reads) == 20


def test_games_enabled():
    s, _ = login("fe-aarav")
    d = s.get(f"{BASE_URL}/api/games/enabled").json()
    ids = d if isinstance(d, list) and (not d or isinstance(d[0], str)) else [g["id"] for g in (d if isinstance(d, list) else d.get("games", d.get("ids", [])))]
    print("FE games", d)
    assert ids == FE_GAMES
    s2, _ = login("stu-ananya")
    d2 = s2.get(f"{BASE_URL}/api/games/enabled").json()
    print("EQ games", d2)
    ids2 = d2 if isinstance(d2, list) and (not d2 or isinstance(d2[0], str)) else [g["id"] for g in (d2 if isinstance(d2, list) else d2.get("games", d2.get("ids", [])))]
    assert ids2 == ["sudoku", "memory", "zerokata"]


# --- media scoping
def test_media_scoping(admin):
    fe = login("fe-aarav")[0].get(f"{BASE_URL}/api/media").json()
    assert len(fe) == 16 and all(m["programme"] == "focusedge" for m in fe)
    for uid in ("stu-ananya", "me-riya", "mm-diya"):
        m = login(uid)[0].get(f"{BASE_URL}/api/media").json()
        assert all(x.get("programme") in (None, "all") for x in m), uid
        print(uid, len(m))
    allm = admin.get(f"{BASE_URL}/api/media").json()
    assert len([x for x in allm if x.get("programme") == "focusedge"]) >= 16
    assert len(allm) >= len(fe) + 14


def test_admin_media_crud_fe(admin):
    r = admin.post(f"{BASE_URL}/api/admin/media", json={"kind": "short", "title": "TEST_fe short", "url": "https://youtu.be/dQw4w9WgXcQ", "programme": "focusedge"})
    assert r.status_code == 200, r.text
    mid = r.json()["id"]
    try:
        assert r.json()["programme"] == "focusedge"
        fe = login("fe-aarav")[0].get(f"{BASE_URL}/api/media").json()
        assert mid in [m["id"] for m in fe]
        eq = login("stu-ananya")[0].get(f"{BASE_URL}/api/media").json()
        assert mid not in [m["id"] for m in eq]
    finally:
        assert admin.delete(f"{BASE_URL}/api/admin/media/{mid}").status_code == 200
    bad = admin.post(f"{BASE_URL}/api/admin/media", json={"kind": "short", "title": "TEST_bad", "url": "https://youtu.be/dQw4w9WgXcQ", "programme": "xyz"})
    assert bad.status_code == 422


# --- admin content
def test_admin_items_fe(admin):
    d = admin.get(f"{BASE_URL}/api/admin/items?programme=focusedge").json()
    assert len(d["items"]) == 300
    assert [a["key"] for a in d["areas"]] == FE_KEYS
    assert len(d["subthemes"]) == 40
    c = Counter(i["area"] for i in d["items"])
    assert all(c[k] == 30 for k in FE_KEYS)


def test_admin_activities_stats_doc_fe(admin):
    acts = admin.get(f"{BASE_URL}/api/admin/activities?programme=focusedge").json()
    assert acts and all(a["id"].startswith("fe-") for a in acts)
    st = admin.get(f"{BASE_URL}/api/admin/stats?programme=focusedge")
    assert st.status_code == 200
    print(str(st.json())[:400])
    md = admin.get(f"{BASE_URL}/api/admin/product-doc?programme=focusedge").json()["markdown"]
    assert "FocusEdge" in md
    assert len(set(re.findall(r"\bD\d+\.\d-\d\d\b", md))) == 300


# --- counsellors
@pytest.mark.parametrize("cid", ["mm-neha", "me-rahul"])
def test_counsellor_sees_fe(cid):
    s, _ = login(cid)
    d = s.get(f"{BASE_URL}/api/counsellor/students").json()
    rows = d if isinstance(d, list) else d.get("students", [])
    ids = {x["student"]["id"] for x in rows}
    assert {"fe-aarav", "fe-meher", "fe-vihaan"} <= ids
    meher = [x for x in rows if x["student"]["id"] == "fe-meher"][0]
    print(cid, {k: v for k, v in meher.items() if k != "student"})
    rep = s.get(f"{BASE_URL}/api/counsellor/students/fe-meher")
    assert rep.status_code == 200


def test_kavya_cannot_see_fe():
    s, _ = login("cou-kavya")
    d = s.get(f"{BASE_URL}/api/counsellor/students").json()
    rows = d if isinstance(d, list) else d.get("students", [])
    assert not any(x["student"]["id"].startswith("fe-") for x in rows)
