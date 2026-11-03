# EquiMind API regression tests: auth, check-in start/submit, scoring, retake rules, reports, progress, admin, authz
import os
import sys
import random
import pytest
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from content import FATIGUE_ITEMS, ITEMS  # noqa: E402

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def login(uid):
    r = requests.post(f"{API}/auth/demo-login", json={"user_id": uid}, timeout=30)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def ananya():
    return login("stu-ananya")


@pytest.fixture(scope="module")
def rohan():
    return login("stu-rohan")


@pytest.fixture(scope="module")
def admin():
    return login("adm-platform")


def level(s):
    return "Needs care first" if s < 35 else "Watch" if s < 50 else "Steady" if s < 65 else "Strength"


def expected(items, resp):
    areas = {}
    for k in "ABCDEF":
        ids = [i for i in items if ITEMS[i]["area"] == k]
        assert len(ids) == 4
        raw = sum(resp[i] for i in ids)
        areas[k] = round(100 - raw / 16 * 100)
    overall = round(sum(areas.values()) / 6)
    path = 2 if (any(v < 35 for v in areas.values()) or overall < 45) else 1
    fat = sum(1 for i in items if i in FATIGUE_ITEMS and resp[i] >= 3)
    body = areas["B"] < 50 or areas["C"] < 55 or fat >= 3 or path == 2
    return areas, overall, path, body


# Auth
class TestAuth:
    def test_demo_users(self):
        r = requests.get(f"{API}/auth/demo-users")
        assert r.status_code == 200
        ids = {u["id"] for u in r.json()}
        assert {"stu-ananya", "stu-rohan", "stu-meera", "adm-platform"} <= ids

    def test_me(self, ananya):
        r = requests.get(f"{API}/auth/me", headers=ananya)
        assert r.status_code == 200 and r.json()["id"] == "stu-ananya" and r.json()["role"] == "student"

    def test_unknown_user(self):
        assert requests.post(f"{API}/auth/demo-login", json={"user_id": "nope"}).status_code == 404

    def test_unauth(self):
        for m, p in [("get", "/auth/me"), ("get", "/reports"), ("post", "/assessments/start"), ("get", "/admin/stats")]:
            assert getattr(requests, m)(f"{API}{p}").status_code == 401, p
        assert requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer bad"}).status_code == 401


# Authorization
class TestAuthz:
    def test_student_admin_403(self, ananya):
        for p in ["/admin/stats", "/admin/items", "/admin/activities"]:
            assert requests.get(f"{API}{p}", headers=ananya).status_code == 403

    def test_admin_cannot_start(self, admin):
        assert requests.post(f"{API}/assessments/start", headers=admin).status_code == 403
        assert requests.get(f"{API}/reports", headers=admin).status_code == 403


# Check-in flow, scoring, retake, progress
class TestCheckin:
    state = {}

    def test_start_structure(self, ananya):
        r = requests.post(f"{API}/assessments/start", headers=ananya, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert len(d["items"]) == 24
        subs = [ITEMS[i["id"]]["subtheme"] for i in d["items"]]
        assert len(set(subs)) == 24
        # idempotent while in progress
        r2 = requests.post(f"{API}/assessments/start", headers=ananya)
        assert r2.json()["id"] == d["id"]
        TestCheckin.state["a1"] = d

    def test_submit_validation(self, ananya):
        d = TestCheckin.state["a1"]
        partial = {i["id"]: 1 for i in d["items"][:23]}
        assert requests.post(f"{API}/assessments/{d['id']}/submit", headers=ananya, json={"responses": partial}).status_code == 422
        bad = {i["id"]: 5 for i in d["items"]}
        assert requests.post(f"{API}/assessments/{d['id']}/submit", headers=ananya, json={"responses": bad}).status_code == 422

    def test_submit_and_scoring(self, ananya):
        d = TestCheckin.state["a1"]
        rng = random.Random(7)
        resp = {i["id"]: rng.randint(0, 4) for i in d["items"]}
        r = requests.post(f"{API}/assessments/{d['id']}/submit", headers=ananya, json={"responses": resp}, timeout=120)
        assert r.status_code == 200, r.text
        rep = r.json()
        areas, overall, path, body = expected([i["id"] for i in d["items"]], resp)
        got = {a["key"]: a["score"] for a in rep["areas"]}
        assert got == areas
        for a in rep["areas"]:
            assert a["level"] == level(a["score"])
        assert rep["overall"] == overall and rep["path"] == path and rep["body_page"] == body
        lowest = sorted(areas.values())[:3]
        assert sorted(got[k] for k in rep["priorities"]) == lowest
        assert len(rep["priority_pages"]) == 3 and 1 <= len(rep["plan"]) <= 5
        n = rep["narrative"]
        assert n["source"] in ("ai", "template") and len(n["loop"]) == 4
        print("narrative source:", n["source"])
        assert "_id" not in rep
        TestCheckin.state["r1"] = rep
        TestCheckin.state["resp1"] = resp
        # double submit blocked
        assert requests.post(f"{API}/assessments/{d['id']}/submit", headers=ananya, json={"responses": resp}).status_code == 400

    def test_retake_excludes_previous(self, ananya):
        prev_items = {i["id"] for i in TestCheckin.state["a1"]["items"]}
        r = requests.post(f"{API}/assessments/start", headers=ananya)
        d = r.json()
        assert d["kind"] == "retake_excluding_previous"
        ids = {i["id"] for i in d["items"]}
        assert len(ids) == 24 and not (ids & prev_items)
        assert len({ITEMS[i]["subtheme"] for i in ids}) == 24
        TestCheckin.state["a2"] = d

    def test_report_get_and_list(self, ananya):
        rid = TestCheckin.state["r1"]["id"]
        r = requests.get(f"{API}/reports/{rid}", headers=ananya)
        assert r.status_code == 200 and r.json()["id"] == rid and "scripts" in r.json()
        rows = requests.get(f"{API}/reports", headers=ananya).json()
        assert rid in [x["id"] for x in rows]

    def test_cross_student_isolation(self, rohan):
        rid = TestCheckin.state["r1"]["id"]
        assert requests.get(f"{API}/reports/{rid}", headers=rohan).status_code == 404
        assert requests.patch(f"{API}/reports/{rid}/progress", headers=rohan, json={"ticks": ["x"]}).status_code == 404
        aid = TestCheckin.state["a2"]["id"]
        resp = {i["id"]: 0 for i in TestCheckin.state["a2"]["items"]}
        assert requests.post(f"{API}/assessments/{aid}/submit", headers=rohan, json={"responses": resp}).status_code == 404

    def test_progress_persist(self, ananya):
        rid = TestCheckin.state["r1"]["id"]
        body = {"ticks": ["0-0", "1-3"], "moods": {"0": 2, "5": 4}, "tracker": {"0-1": "TEST_note"},
                "reflections": {"0": "TEST_reflection"}}
        r = requests.patch(f"{API}/reports/{rid}/progress", headers=ananya, json=body)
        assert r.status_code == 200
        g = requests.get(f"{API}/reports/{rid}", headers=ananya).json()
        for k, v in body.items():
            assert g[k] == v
        assert requests.patch(f"{API}/reports/{rid}/progress", headers=ananya, json={}).status_code == 400

    def test_path2_high_stress(self, rohan):
        d = requests.post(f"{API}/assessments/start", headers=rohan).json()
        resp = {i["id"]: 4 for i in d["items"]}
        r = requests.post(f"{API}/assessments/{d['id']}/submit", headers=rohan, json={"responses": resp}, timeout=120)
        assert r.status_code == 200, r.text
        rep = r.json()
        assert all(a["score"] == 0 and a["level"] == "Needs care first" for a in rep["areas"])
        assert rep["overall"] == 0 and rep["path"] == 2 and rep["body_page"] is True
        print("rohan narrative source:", rep["narrative"]["source"])


# Admin
class TestAdmin:
    def test_items(self, admin):
        d = requests.get(f"{API}/admin/items", headers=admin).json()
        assert len(d["items"]) == 180 and len(d["areas"]) == 6 and len(d["subthemes"]) == 24

    def test_activities(self, admin):
        d = requests.get(f"{API}/admin/activities", headers=admin).json()
        assert len(d) > 0 and all("area_name" in a for a in d)

    def test_stats(self, admin):
        d = requests.get(f"{API}/admin/stats", headers=admin).json()
        assert d["min_cohort"] == 3
        print("stats:", d)
        if d["students"] < 3:
            assert d["suppressed"] is True and "areas" not in d
        else:
            assert d["suppressed"] is False and len(d["areas"]) == 6 and "avg_overall" in d
