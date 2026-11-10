# Wellness API tests: /api/wellness/today and /api/wellness/reads (exercise, game, nudge, reads, mood personalisation)
import os, random
import pytest
import requests
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or dict(
    l.strip().split("=", 1) for l in open("/app/frontend/.env") if "=" in l)["REACT_APP_BACKEND_URL"]
BASE_URL = BASE_URL.rstrip("/")
_env = dict(l.strip().split("=", 1) for l in open("/app/backend/.env") if "=" in l)
DB = MongoClient(_env["MONGO_URL"].strip('"'))[_env["DB_NAME"].strip('"')]

CALMING = {"box_breath", "breath_478", "calm_sigh", "grounding", "body_release", "kind_voice", "worry_window"}
AREA_NAMES = {"A", "B", "C", "D", "E", "F"}


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---- Ananya (has a report, read only)
class TestAnanyaToday:
    def test_today_structure(self):
        h = login("stu-ananya")
        rep = requests.get(f"{BASE_URL}/api/reports", headers=h).json()[0]
        d = requests.get(f"{BASE_URL}/api/wellness/today", headers=h).json()
        assert d["personalised"] is True
        ex = d["exercise"]
        assert ex["kind"] in ("breath", "steps") and isinstance(ex["why"], str) and ex["why"]
        if ex["kind"] == "breath":
            assert "pattern" in ex
        else:
            assert len(ex["steps"]) >= 3
        assert d["game"]["tag"] == "Hustle for Your Brain"
        assert d["game"]["id"] in ("sudoku", "memory", "zerokata")
        assert set(d["nudge"].keys()) >= {"title", "text", "area_tip"}
        assert len(d["reads"]) == 3
        assert [r["area"] for r in d["reads"]] == rep["priorities"][:3]
        assert [f["key"] for f in d["focus_areas"]] == rep["priorities"][:3]
        assert "mood" in d and "mood_label" in d
        assert "_id" not in str(d)

    def test_reads_all(self):
        h = login("stu-ananya")
        pri = requests.get(f"{BASE_URL}/api/reports", headers=h).json()[0]["priorities"]
        rows = requests.get(f"{BASE_URL}/api/wellness/reads", headers=h).json()
        assert len(rows) == 18 and len({r["id"] for r in rows}) == 18
        assert all(r["for_you"] == (r["area"] in pri[:3]) for r in rows)
        assert [r["area"] for r in rows[:9]] == [p for p in pri[:3] for _ in range(3)]
        assert all(r["for_you"] for r in rows[:9]) and not any(r["for_you"] for r in rows[9:])
        assert all(len(r["body"]) >= 3 and r["try"] and r["area_name"] for r in rows)


# ---- auth / roles
class TestAuthz:
    def test_admin_forbidden(self):
        h = login("adm-platform")
        assert requests.get(f"{BASE_URL}/api/wellness/today", headers=h).status_code == 403
        assert requests.get(f"{BASE_URL}/api/wellness/reads", headers=h).status_code == 403

    def test_unauth(self):
        assert requests.get(f"{BASE_URL}/api/wellness/today").status_code == 401


# ---- Meera (no report) -> non-personalised
class TestNoReport:
    def test_non_personalised(self):
        h = login("stu-meera")
        if requests.get(f"{BASE_URL}/api/reports", headers=h).json():
            pytest.skip("meera has a report")
        d = requests.get(f"{BASE_URL}/api/wellness/today", headers=h).json()
        assert d["personalised"] is False and d["mood"] is None and d["mood_label"] is None
        assert len(d["reads"]) == 3 and d["game"]["tag"] == "Hustle for Your Brain"
        assert d["nudge"]["title"] == "A fresh day, a fresh start"
        rows = requests.get(f"{BASE_URL}/api/wellness/reads", headers=h).json()
        assert len(rows) == 18


# ---- Rohan: create a TEST report, set moods, verify personalisation; cleanup by id
class TestMoodPersonalisation:
    ids = []

    @classmethod
    def teardown_class(cls):
        for rid, aid in cls.ids:
            DB.reports.delete_one({"id": rid})
            DB.assessments.delete_one({"id": aid})

    def _make(self, h, hours_ago=0):
        a = requests.post(f"{BASE_URL}/api/assessments/start", headers=h).json()
        r = requests.post(f"{BASE_URL}/api/assessments/{a['id']}/submit", headers=h, timeout=120,
                          json={"responses": {i["id"]: random.randint(0, 4) for i in a["items"]}}).json()
        self.ids.append((r["id"], a["id"]))
        if hours_ago:
            DB.reports.update_one({"id": r["id"]}, {"$set": {"created_at": (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()}})
        return r

    def test_struggling_mood(self):
        h = login("stu-rohan")
        r = self._make(h)
        pri = r["priorities"]
        p = requests.patch(f"{BASE_URL}/api/reports/{r['id']}/progress", headers=h, json={"moods": {"0": 0}})
        assert p.status_code == 200
        d = requests.get(f"{BASE_URL}/api/wellness/today", headers=h).json()
        assert d["mood"] == 0 and d["mood_label"] == "Struggling"
        assert d["nudge"]["title"] == "Be extra gentle with yourself today"
        assert d["exercise"]["id"] in CALMING
        assert d["reads"][0]["area"] == pri[0]
        assert d["reads"][0]["tone"] == "calm"
        assert "struggling" in d["exercise"]["why"].lower()

    def test_strong_mood_and_day_key(self):
        h = login("stu-rohan")
        if not self.ids:
            pytest.skip("no report")
        rid = self.ids[-1][0]
        DB.reports.update_one({"id": rid}, {"$set": {"created_at": (datetime.now(timezone.utc) - timedelta(hours=50)).isoformat()}})
        requests.patch(f"{BASE_URL}/api/reports/{rid}/progress", headers=h, json={"moods": {"2": 4, "0": 0}})
        d = requests.get(f"{BASE_URL}/api/wellness/today", headers=h).json()
        assert d["mood_label"] == "Strong"  # elapsed 2 -> moods key "2"
        assert d["nudge"]["title"] == "Let this good energy grow"
        bad = requests.patch(f"{BASE_URL}/api/reports/{rid}/progress", headers=h, json={"moods": {"2": 9}})
        assert bad.status_code == 422
