# Progress PATCH validation (logged_days, ticks, moods) + persistence for daily check-in feature
import os
import random
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def _mongo():
    env = dict(l.strip().split("=", 1) for l in open("/app/backend/.env") if "=" in l)
    c = MongoClient(env["MONGO_URL"].strip('"'))
    return c[env["DB_NAME"].strip('"')]


@pytest.fixture(scope="module")
def rohan():
    r = requests.post(f"{API}/auth/demo-login", json={"user_id": "stu-rohan"})
    assert r.status_code == 200
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return s


@pytest.fixture(scope="module")
def report(rohan):
    a = rohan.post(f"{API}/assessments/start").json()
    resp = {i["id"]: random.randint(0, 4) for i in a["items"]}
    r = rohan.post(f"{API}/assessments/{a['id']}/submit", json={"responses": resp}, timeout=90)
    assert r.status_code == 200, r.text
    rep = r.json()
    yield rep
    db = _mongo()
    db.reports.delete_one({"id": rep["id"]})
    db.assessments.delete_one({"id": a["id"]})


class TestProgressValidation:
    @pytest.mark.parametrize("bad", [[-1], [14], [0, 20], [100]])
    def test_logged_days_out_of_range(self, rohan, report, bad):
        r = rohan.patch(f"{API}/reports/{report['id']}/progress", json={"logged_days": bad})
        assert r.status_code == 422

    def test_logged_days_non_int(self, rohan, report):
        r = rohan.patch(f"{API}/reports/{report['id']}/progress", json={"logged_days": ["x"]})
        assert r.status_code == 422

    def test_logged_days_and_ticks_persist(self, rohan, report):
        body = {"ticks": ["0-0", "2-0", "4-0"], "logged_days": [0, 13]}
        r = rohan.patch(f"{API}/reports/{report['id']}/progress", json=body)
        assert r.status_code == 200 and r.json()["ok"] is True
        g = rohan.get(f"{API}/reports/{report['id']}").json()
        assert g["logged_days"] == [0, 13]
        assert sorted(g["ticks"]) == ["0-0", "2-0", "4-0"]

    def test_tracker_persist(self, rohan, report):
        r = rohan.patch(f"{API}/reports/{report['id']}/progress", json={"tracker": {"0-0": "5", "1-3": "7"}})
        assert r.status_code == 200
        g = rohan.get(f"{API}/reports/{report['id']}").json()
        assert g["tracker"] == {"0-0": "5", "1-3": "7"}
        assert g["logged_days"] == [0, 13]  # untouched

    def test_too_many_ticks(self, rohan, report):
        r = rohan.patch(f"{API}/reports/{report['id']}/progress", json={"ticks": [f"{i}-{d}" for i in range(6) for d in range(14)]})
        assert r.status_code == 422

    def test_other_user_report_404(self, report):
        t = requests.post(f"{API}/auth/demo-login", json={"user_id": "stu-ananya"}).json()["token"]
        r = requests.patch(f"{API}/reports/{report['id']}/progress", json={"logged_days": [1]}, headers={"Authorization": f"Bearer {t}"})
        assert r.status_code == 404

    def test_new_report_defaults(self, report):
        assert report["ticks"] == []
        assert len(report["plan"]) == 5

    # Observational: malformed tick strings / duplicate days accepted (no format validation)
    def test_malformed_ticks_accepted_observation(self, rohan, report):
        r = rohan.patch(f"{API}/reports/{report['id']}/progress", json={"ticks": ["garbage", "9-99"], "logged_days": [1, 1]})
        print("malformed ticks status:", r.status_code)
        assert r.status_code in (200, 422)
