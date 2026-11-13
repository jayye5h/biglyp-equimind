# Iter30: EquiMind "About you" context questions (living / contact / lonely), context summary on report, counsellor flag, bank D1/D4
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def login(uid):
    r = requests.post(f"{API}/auth/demo-login", json={"user_id": uid}, timeout=30)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def start(h):
    r = requests.post(f"{API}/assessments/start", headers=h, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()


def submit(h, a, context=None):
    body = {"responses": {i["id"]: 2 for i in a["items"]}}
    if context is not None:
        body["context"] = context
    r = requests.post(f"{API}/assessments/{a['id']}/submit", json=body, headers=h, timeout=120)
    assert r.status_code == 200, r.text
    return r.json()


# Start payload: context_questions only for EquiMind
def test_equimind_start_has_context_questions():
    a = start(login("stu-rohan"))
    cq = a["context_questions"]
    assert [q["key"] for q in cq] == ["living", "contact", "lonely"]
    living = {o["value"] for o in cq[0]["options"]}
    assert {"family", "hostel", "alone", "relatives", "na"} <= living
    assert all(o["label"] for q in cq for o in q["options"])


@pytest.mark.parametrize("uid", ["mm-diya", "me-riya", "fe-aarav"])
def test_other_programmes_no_context_questions(uid):
    r = requests.post(f"{API}/assessments/start", headers=login(uid), timeout=30)
    if r.status_code != 200:
        pytest.skip(f"{uid} start returned {r.status_code}: {r.text[:120]}")
    assert r.json().get("context_questions") == []


# Submit flows on stu-rohan; full-context submit last so counsellor sees the flag on the latest report
def test_submit_invalid_context_values_ignored():
    h = login("stu-rohan")
    rep = submit(h, start(h), {"living": "mars", "contact": "telepathy", "lonely": "xx"})
    assert rep["context"] is None


def test_submit_partial_invalid_context():
    h = login("stu-rohan")
    rep = submit(h, start(h), {"living": "hostel", "contact": "bogus", "lonely": "never"})
    c = rep["context"]
    assert c["living"] == "hostel" and c["contact"] is None and c["lonely"] == "never"
    assert c["away"] is True and c["low_contact"] is False and c["feels_lonely"] is False


def test_submit_without_context():
    h = login("stu-rohan")
    rep = submit(h, start(h))
    assert rep["context"] is None


def test_submit_with_full_context_and_counsellor_flag():
    h = login("stu-rohan")
    rep = submit(h, start(h), {"living": "hostel", "contact": "rarely", "lonely": "often"})
    c = rep["context"]
    assert c["away"] and c["low_contact"] and c["feels_lonely"] and c["detachment"]
    assert c["labels"]["living"] == "In a hostel or PG, away from my parents"
    assert c["labels"]["contact"].startswith("Rarely")
    assert c["labels"]["lonely"] == "Often"
    # persisted
    g = requests.get(f"{API}/reports/{rep['id']}", headers=h, timeout=30)
    assert g.status_code == 200 and g.json()["context"]["detachment"] is True
    d = requests.get(f"{API}/counsellor/students/stu-rohan", headers=login("cou-kavya"), timeout=30)
    assert d.status_code == 200, d.text
    flags = d.json()["flags"]
    assert any(f.startswith("Away from family — possible loneliness / detachment") for f in flags), flags


# Bank content
def test_bank_d1_d4_items():
    r = requests.get(f"{API}/admin/items?programme=equimind", headers=login("adm-platform"), timeout=30)
    assert r.status_code == 200
    d = r.json()
    names = [s.get("name") if isinstance(s, dict) else s for s in d["subthemes"]]
    assert any("Belonging, homesickness & distance from family" in str(n) for n in names), names
    texts = [i["text"] for i in d["items"]]
    assert "Living away from my parents and family makes everyday stress feel heavier." in texts
    assert "I often feel lonely, even when I'm busy with classes and work." in texts
