# Iteration 9: counselling bookings/portal, push reminders/cron, feedback progress, role guards
import os
import time
import uuid
import pytest
import requests
from dotenv import dotenv_values

BASE_URL = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")
SECRET = dotenv_values("/app/backend/.env")["WEBHOOK_CRON_SECRET"]


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


@pytest.fixture(scope="module")
def ananya():
    return login("stu-ananya")


@pytest.fixture(scope="module")
def rohan():
    return login("stu-rohan")


@pytest.fixture(scope="module")
def meera():
    return login("stu-meera")


@pytest.fixture(scope="module")
def kavya():
    return login("cou-kavya")


@pytest.fixture(scope="module")
def admin():
    return login("adm-platform")


def latest_report_id(s):
    rows = s.get(f"{BASE_URL}/api/reports").json()
    return rows[0]["id"]


# ---------- push / cron
class TestPush:
    def test_public_key(self):
        r = requests.get(f"{BASE_URL}/api/push/public-key")
        assert r.status_code == 200 and len(r.json()["publicKey"]) > 40

    def test_subscribe_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/push/subscribe", json={"endpoint": "https://x.test/a", "keys": {}})
        assert r.status_code == 401

    def test_subscribe_requires_https(self, rohan):
        r = rohan.post(f"{BASE_URL}/api/push/subscribe", json={"endpoint": "http://x.test/a", "keys": {"p256dh": "a", "auth": "b"}})
        assert r.status_code == 422

    def test_subscribe_and_unsubscribe(self, rohan):
        ep = f"https://fcm.test/TEST_{uuid.uuid4()}"
        body = {"endpoint": ep, "keys": {"p256dh": "x", "auth": "y"}}
        assert rohan.post(f"{BASE_URL}/api/push/subscribe", json=body).status_code == 200
        assert rohan.get(f"{BASE_URL}/api/push/status").json()["subscribed"] is True
        assert rohan.post(f"{BASE_URL}/api/push/unsubscribe", json=body).status_code == 200

    def test_cron_unauthorized(self):
        assert requests.post(f"{BASE_URL}/api/cron/reminders", json={}).status_code == 401
        assert requests.post(f"{BASE_URL}/api/cron/reminders", json={}, headers={"Authorization": "Bearer wrong"}).status_code == 401

    def test_cron_run_and_duplicate_and_notifications(self, ananya, rohan, meera):
        wid = f"TEST_{uuid.uuid4()}"
        h = {"Authorization": f"Bearer {SECRET}", "X-Webhook-Id": wid}
        r = requests.post(f"{BASE_URL}/api/cron/reminders", json={}, headers=h)
        assert r.status_code == 200 and r.json()["accepted"] == wid
        d = requests.post(f"{BASE_URL}/api/cron/reminders", json={}, headers=h)
        assert d.status_code == 200 and d.json().get("duplicate") is True
        time.sleep(3)
        mn = meera.get(f"{BASE_URL}/api/notifications").json()
        assert len(mn) >= 1 and mn[0]["title"] and mn[0]["body"]
        assert "_id" not in mn[0]
        # Rohan journey complete (14 days logged) -> no reminders
        rn = rohan.get(f"{BASE_URL}/api/notifications").json()
        assert rn == [], f"Rohan got notifications: {rn}"


# ---------- role guards
class TestRoles:
    def test_student_blocked_from_counsellor(self, ananya):
        for p in ("students", "sessions", "slots"):
            assert ananya.get(f"{BASE_URL}/api/counsellor/{p}").status_code == 403

    def test_counsellor_blocked_from_student_booking(self, kavya):
        assert kavya.post(f"{BASE_URL}/api/counselling/bookings", json={"note": "x"}).status_code == 403
        assert kavya.get(f"{BASE_URL}/api/counselling/slots").status_code == 403

    def test_counsellor_reads_any_report(self, kavya, meera):
        rid = latest_report_id(meera)
        r = kavya.get(f"{BASE_URL}/api/reports/{rid}")
        assert r.status_code == 200 and r.json()["user_id"] == "stu-meera"

    def test_student_cannot_read_other(self, ananya, meera):
        rid = latest_report_id(meera)
        assert ananya.get(f"{BASE_URL}/api/reports/{rid}").status_code == 404

    def test_admin_cannot_read_report(self, admin, meera):
        assert admin.get(f"{BASE_URL}/api/reports/{latest_report_id(meera)}").status_code == 403


# ---------- feedback in progress
class TestFeedback:
    def test_patch_feedback(self, rohan):
        rid = latest_report_id(rohan)
        rep = rohan.get(f"{BASE_URL}/api/reports/{rid}").json()
        fb = dict(rep.get("feedback") or {})
        orig = fb.get("13")
        fb["13"] = {"helpful": "a_lot", "feel": "better", "comment": "TEST_comment"}
        assert rohan.patch(f"{BASE_URL}/api/reports/{rid}/progress", json={"feedback": fb}).status_code == 200
        got = rohan.get(f"{BASE_URL}/api/reports/{rid}").json()["feedback"]["13"]
        assert got["comment"] == "TEST_comment"
        if orig is not None:
            fb["13"] = orig
            rohan.patch(f"{BASE_URL}/api/reports/{rid}/progress", json={"feedback": fb})


# ---------- bookings
class TestBookings:
    def test_counsellor_lists(self, kavya):
        st = kavya.get(f"{BASE_URL}/api/counsellor/students").json()
        assert len(st) == 3
        byname = {x["student"]["id"]: x for x in st}
        assert byname["stu-meera"]["severity"] == 2
        ses = kavya.get(f"{BASE_URL}/api/counsellor/sessions").json()
        assert any(s["student_id"] == "stu-ananya" and s["status"] == "confirmed" for s in ses)

    def test_slot_booking_flow(self, rohan, meera, kavya):
        slots = rohan.get(f"{BASE_URL}/api/counselling/slots").json()
        assert len(slots) >= 2
        sid = slots[0]["id"]
        b = rohan.post(f"{BASE_URL}/api/counselling/bookings", json={"slot_id": sid, "note": "TEST_note"})
        assert b.status_code == 200, b.text
        bid = b.json()["id"]
        try:
            assert b.json()["status"] == "confirmed" and b.json()["slot"]["id"] == sid
            # double booking by another student
            assert meera.post(f"{BASE_URL}/api/counselling/bookings", json={"slot_id": sid}).status_code == 409
            assert sid not in [s["id"] for s in rohan.get(f"{BASE_URL}/api/counselling/slots").json()]
            # counsellor cannot delete booked slot
            assert kavya.delete(f"{BASE_URL}/api/counsellor/slots/{sid}").status_code == 409
            # request + max-2
            rq = rohan.post(f"{BASE_URL}/api/counselling/bookings", json={"preferred": "TEST_evening", "note": "TEST_req"})
            assert rq.status_code == 200 and rq.json()["status"] == "pending"
            rqid = rq.json()["id"]
            assert rohan.post(f"{BASE_URL}/api/counselling/bookings", json={"note": "TEST_3"}).status_code == 409
            # counsellor confirm request needs slot
            assert kavya.patch(f"{BASE_URL}/api/counsellor/bookings/{rqid}", json={"status": "confirmed"}).status_code == 422
            free = kavya.get(f"{BASE_URL}/api/counselling/slots")  # 403 for counsellor
            assert free.status_code == 403
            free_slots = [s for s in kavya.get(f"{BASE_URL}/api/counsellor/slots").json() if not s["booked_by"]]
            up = kavya.patch(f"{BASE_URL}/api/counsellor/bookings/{rqid}", json={"slot_id": free_slots[-1]["id"], "counsellor_note": "TEST_cn"})
            assert up.status_code == 200 and up.json()["status"] == "confirmed"
            det = kavya.get(f"{BASE_URL}/api/counsellor/students/stu-rohan").json()
            assert any(x["id"] == rqid and x["counsellor_note"] == "TEST_cn" for x in det["bookings"])
            assert rohan.post(f"{BASE_URL}/api/counselling/bookings/{rqid}/cancel").status_code == 200
            assert free_slots[-1]["id"] in [s["id"] for s in rohan.get(f"{BASE_URL}/api/counselling/slots").json()]
        finally:
            for x in rohan.get(f"{BASE_URL}/api/counselling/my").json():
                if x["status"] in ("pending", "confirmed"):
                    rohan.post(f"{BASE_URL}/api/counselling/bookings/{x['id']}/cancel")
        assert sid in [s["id"] for s in rohan.get(f"{BASE_URL}/api/counselling/slots").json()]

    def test_counsellor_slots_add_delete(self, kavya):
        r = kavya.post(f"{BASE_URL}/api/counsellor/slots", json={"starts": ["2030-01-07T09:15"], "minutes": 30, "mode": "TEST_mode"})
        assert r.status_code == 200 and len(r.json()) == 1
        sid = r.json()[0]["id"]
        assert any(s["id"] == sid for s in kavya.get(f"{BASE_URL}/api/counsellor/slots").json())
        assert kavya.delete(f"{BASE_URL}/api/counsellor/slots/{sid}").status_code == 200
        assert not any(s["id"] == sid for s in kavya.get(f"{BASE_URL}/api/counsellor/slots").json())
        assert kavya.post(f"{BASE_URL}/api/counsellor/slots", json={"starts": ["2020-01-01T09:00"]}).status_code == 422

    def test_student_detail(self, kavya):
        d = kavya.get(f"{BASE_URL}/api/counsellor/students/stu-meera")
        assert d.status_code == 200
        j = d.json()
        assert j["report"]["user_id"] == "stu-meera" and j["flags"]
        assert kavya.get(f"{BASE_URL}/api/counsellor/students/cou-kavya").status_code == 404
