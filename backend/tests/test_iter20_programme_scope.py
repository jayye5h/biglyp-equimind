# Iteration 20: read-only checks of programme scoping fixes (sessions, reports, booking patch/book)
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
AARAV_RID = "3520670c-55b6-41c6-8458-f5bbb8b95f94"
ROHAN_RID = "d80e237a-a80c-452c-90cc-0a658c4d5a94"


def tok(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def H():
    return {u: tok(u) for u in ["mm-neha", "cou-kavya", "mm-kabir", "mm-aarav"]}


def _items(data):
    if isinstance(data, dict):
        out = []
        for v in data.values():
            if isinstance(v, list):
                out += v
        return out
    return data


# Sessions scoping
def test_neha_sessions_no_equimind(H):
    r = requests.get(f"{BASE_URL}/api/counsellor/sessions", headers=H["mm-neha"])
    assert r.status_code == 200
    ids = {b.get("student_id") for b in _items(r.json())}
    assert not any(i and i.startswith("stu-") for i in ids), ids


def test_kavya_sessions_has_equimind(H):
    r = requests.get(f"{BASE_URL}/api/counsellor/sessions", headers=H["cou-kavya"])
    assert r.status_code == 200
    items = _items(r.json())
    assert len(items) > 0
    assert all(b.get("student_id", "").startswith("stu-") for b in items)


# Report scoping
@pytest.mark.parametrize("who,rid,code", [
    ("cou-kavya", AARAV_RID, 404), ("mm-neha", AARAV_RID, 200),
    ("mm-neha", ROHAN_RID, 404), ("cou-kavya", ROHAN_RID, 200)])
def test_report_scope(H, who, rid, code):
    r = requests.get(f"{BASE_URL}/api/reports/{rid}", headers=H[who])
    assert r.status_code == code


# Cross-programme booking patch (neha on an EquiMind booking) -> 404
def test_patch_cross_programme(H):
    r = requests.get(f"{BASE_URL}/api/counsellor/sessions", headers=H["cou-kavya"])
    bid = _items(r.json())[0]["id"]
    p = requests.patch(f"{BASE_URL}/api/counsellor/bookings/{bid}", headers=H["mm-neha"], json={"status": "cancelled"})
    assert p.status_code == 404, p.text


# Cross-programme slot booking -> 409
def test_book_equimind_slot_as_mm_student(H):
    r = requests.get(f"{BASE_URL}/api/counsellor/slots", headers=H["cou-kavya"])
    assert r.status_code == 200
    slots = _items(r.json())
    import datetime as _d; now=_d.datetime.now(_d.timezone.utc).isoformat(); free = [s for s in slots if not s.get("booked_by") and not s.get("removed") and s.get("start","")>now]
    assert free
    b = requests.post(f"{BASE_URL}/api/counselling/bookings", headers=H["mm-kabir"],
                      json={"slot_id": free[0]["id"], "mode": "video", "note": "TEST_cross"})
    if b.status_code in (200, 201):
        bid = b.json().get("id")
        requests.post(f"{BASE_URL}/api/counselling/bookings/{bid}/cancel", headers=H["mm-kabir"])
    assert b.status_code == 409, b.text
