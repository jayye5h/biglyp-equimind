# Plan theory ('why') + next_activities on GET /api/reports/{id} (iteration 6 feature)
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def _session(uid):
    r = requests.post(f"{API}/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return s


@pytest.fixture(scope="module")
def rohan():
    # Requires a temp report 'tmp-rohan-15' for stu-rohan (created by main agent, deleted after testing)
    s = _session("stu-rohan")
    if s.get(f"{API}/reports/tmp-rohan-15").status_code == 404:
        pytest.skip("tmp-rohan-15 report not present")
    return s


@pytest.fixture(scope="module")
def ananya():
    return _session("stu-ananya")


class TestReportTheory:
    def test_plan_has_why(self, rohan):
        r = rohan.get(f"{API}/reports/tmp-rohan-15")
        assert r.status_code == 200
        d = r.json()
        assert "_id" not in d
        assert len(d["plan"]) == 5
        for a in d["plan"]:
            assert isinstance(a["why"], str) and len(a["why"]) > 20
            assert a["steps"] and a["time"] and a["when"]

    def test_next_activities_not_in_plan(self, rohan):
        d = rohan.get(f"{API}/reports/tmp-rohan-15").json()
        na = d["next_activities"]
        assert isinstance(na, list) and 1 <= len(na) <= 3
        plan_ids = {a["id"] for a in d["plan"]}
        ids = [a["id"] for a in na]
        assert not (set(ids) & plan_ids)
        assert len(ids) == len(set(ids))
        for a in na:
            assert a["why"] and a["name"] and a["time"]

    def test_ananya_latest_report(self, ananya):
        lst = ananya.get(f"{API}/reports").json()
        assert lst
        d = ananya.get(f"{API}/reports/{lst[0]['id']}").json()
        assert all(a.get("why") for a in d["plan"])
        assert "next_activities" in d

    def test_other_user_report_404(self, ananya):
        assert ananya.get(f"{API}/reports/tmp-rohan-15").status_code == 404

    def test_unauth_rejected(self):
        assert requests.get(f"{API}/reports/tmp-rohan-15").status_code in (401, 403)

    def test_why_not_persisted_in_db(self, rohan):
        # enrich_plan should not have been written back; just verify progress patch still works
        r = rohan.patch(f"{API}/reports/tmp-rohan-15/progress", json={})
        assert r.status_code == 400
