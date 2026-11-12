# Iteration 16: notification module (admin channel switches, test sends, delivery log, contacts, booking hooks, cron sweep, low-mood, reminders)
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytest
import requests
from dotenv import dotenv_values
from pymongo import MongoClient

BASE_URL = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")
BENV = dotenv_values("/app/backend/.env")
SECRET = BENV["WEBHOOK_CRON_SECRET"]
DB = MongoClient(BENV["MONGO_URL"])[BENV["DB_NAME"]]
EVENTS = ["checkin_reminder", "session_booked", "session_cancelled", "session_reminder", "week1_unlocked", "week2_unlocked", "low_mood_alert"]
CONTACTS = {
    "stu-meera": ("meera.iyer@demo-university.edu", "+91 98450 11003"),
    "adm-platform": ("admin@biglyp.com", "+91 98450 33001"),
}


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


def wait_log(pred, tries=12):
    for _ in range(tries):
        rows = list(DB.notification_log.find(pred, {"_id": 0}))
        if rows:
            return rows
        time.sleep(0.5)
    return []


@pytest.fixture(scope="module")
def adm():
    return login("adm-platform")


@pytest.fixture(scope="module")
def meera():
    return login("stu-meera")


@pytest.fixture(scope="module")
def kavya():
    return login("cou-kavya")


def cron(path, auth=True, wid=None):
    h = {"X-Webhook-Id": wid or f"TEST_{uuid.uuid4()}"}
    if auth:
        h["Authorization"] = f"Bearer {SECRET}"
    t = time.time()
    r = requests.post(f"{BASE_URL}/api/cron/{path}", headers=h, json={})
    return r, time.time() - t


class TestAdminNotifications:
    def test_list(self, adm):
        d = adm.get(f"{BASE_URL}/api/admin/notifications").json()
        assert [e["id"] for e in d["events"]] == EVENTS
        assert d["providers"]["email"]["connected"] is False
        assert d["providers"]["sms"]["mode"] == "demo"
        assert all(set(e["channels"]) == {"email", "sms", "app"} for e in d["events"])

    def test_non_admin_403(self, meera, kavya):
        for s in (meera, kavya):
            assert s.get(f"{BASE_URL}/api/admin/notifications").status_code == 403
            assert s.get(f"{BASE_URL}/api/admin/notifications/log").status_code == 403
            assert s.put(f"{BASE_URL}/api/admin/notifications/session_booked", json={"sms": False}).status_code == 403
            assert s.post(f"{BASE_URL}/api/admin/notifications/session_booked/test").status_code == 403

    def test_put_validation(self, adm):
        assert adm.put(f"{BASE_URL}/api/admin/notifications/nope", json={"sms": False}).status_code == 404
        assert adm.put(f"{BASE_URL}/api/admin/notifications/session_booked", json={}).status_code == 400

    def test_toggle_persist_and_test_send(self, adm):
        try:
            r = adm.put(f"{BASE_URL}/api/admin/notifications/week1_unlocked", json={"sms": False})
            assert r.status_code == 200 and r.json()["channels"] == {"email": True, "sms": False, "app": True}
            d = adm.get(f"{BASE_URL}/api/admin/notifications").json()
            assert next(e for e in d["events"] if e["id"] == "week1_unlocked")["channels"]["sms"] is False
            res = adm.post(f"{BASE_URL}/api/admin/notifications/week1_unlocked/test").json()["result"]
            assert res == {"email": "not_connected", "sms": "off", "app": "sent"}
        finally:
            adm.put(f"{BASE_URL}/api/admin/notifications/week1_unlocked", json={"sms": True})
        res = adm.post(f"{BASE_URL}/api/admin/notifications/session_booked/test").json()["result"]
        assert res == {"email": "not_connected", "sms": "demo", "app": "sent"}
        log = adm.get(f"{BASE_URL}/api/admin/notifications/log?event=session_booked&limit=3").json()
        assert {l["channel"]: l["status"] for l in log} == {"email": "not_connected", "sms": "demo", "app": "sent"}
        assert all(l["test"] and l["user_id"] == "adm-platform" and "_id" not in l and "key" not in l for l in log)
        sms = adm.get(f"{BASE_URL}/api/admin/notifications/log?channel=sms&limit=20").json()
        assert sms and all(l["channel"] == "sms" for l in sms)
        inbox = adm.get(f"{BASE_URL}/api/notifications").json()
        assert inbox[0]["title"].startswith("[Test]")

    def test_404_test_unknown(self, adm):
        assert adm.post(f"{BASE_URL}/api/admin/notifications/zzz/test").status_code == 404


class TestContacts:
    def test_get_put_validate_restore(self, adm):
        orig = CONTACTS["adm-platform"]
        try:
            assert adm.get(f"{BASE_URL}/api/me/contact").json() == {"email": orig[0], "phone": orig[1]}
            assert adm.put(f"{BASE_URL}/api/me/contact", json={"email": "bad", "phone": orig[1]}).status_code == 422
            assert adm.put(f"{BASE_URL}/api/me/contact", json={"email": orig[0], "phone": "abc"}).status_code == 422
            assert adm.put(f"{BASE_URL}/api/me/contact", json={"email": "", "phone": orig[1]}).status_code == 200
            res = adm.post(f"{BASE_URL}/api/admin/notifications/session_cancelled/test").json()["result"]
            assert res["email"] == "no_contact"
        finally:
            r = adm.put(f"{BASE_URL}/api/me/contact", json={"email": orig[0], "phone": orig[1]})
        assert r.json() == {"email": orig[0], "phone": orig[1]}

    def test_unauth(self):
        assert requests.get(f"{BASE_URL}/api/me/contact").status_code in (401, 403)


class TestBookingHooks:
    def test_student_book_cancel(self, meera, kavya):
        active = [b for b in meera.get(f"{BASE_URL}/api/counselling/my").json() if b["status"] in ("pending", "confirmed")]
        if len(active) >= 2:
            pytest.skip("Meera already has 2 active bookings")
        slots = [s for s in meera.get(f"{BASE_URL}/api/counselling/slots").json() if s["counsellor_id"] == "cou-kavya"]
        if not slots:
            pytest.skip("no open slot")
        b = meera.post(f"{BASE_URL}/api/counselling/bookings", json={"slot_id": slots[0]["id"], "note": "TEST_notif"})
        assert b.status_code == 200
        bid = b.json()["id"]
        try:
            rows = wait_log({"event": "session_booked", "key": {"$regex": f"^session_booked:{bid}"}})
            time.sleep(1)
            rows = list(DB.notification_log.find({"event": "session_booked", "key": {"$regex": f"^session_booked:{bid}"}}, {"_id": 0}))
            assert {r["user_id"] for r in rows} == {"stu-meera", "cou-kavya"} and len(rows) == 6
            assert any(n["event"] == "session_booked" for n in meera.get(f"{BASE_URL}/api/notifications").json()[:5])
            assert any(n["event"] == "session_booked" for n in kavya.get(f"{BASE_URL}/api/notifications").json()[:5])
        finally:
            c = meera.post(f"{BASE_URL}/api/counselling/bookings/{bid}/cancel")
        assert c.status_code == 200
        time.sleep(1.5)
        rows = list(DB.notification_log.find({"event": "session_cancelled", "key": {"$regex": f"^session_cancelled:{bid}"}}, {"_id": 0}))
        assert {r["user_id"] for r in rows} == {"stu-meera", "cou-kavya"} and len(rows) == 6
        s_app = next(r for r in rows if r["user_id"] == "stu-meera" and r["channel"] == "sms")
        assert s_app["status"] == "demo" and s_app["to"] == CONTACTS["stu-meera"][1]

    def test_counsellor_confirm_and_cancel(self, meera, kavya):
        active = [b for b in meera.get(f"{BASE_URL}/api/counselling/my").json() if b["status"] in ("pending", "confirmed")]
        if len(active) >= 2:
            pytest.skip("Meera already has 2 active bookings")
        slots = [s for s in kavya.get(f"{BASE_URL}/api/counsellor/slots").json() if not s.get("booked_by") and s["start"] > datetime.now(timezone.utc).isoformat()]
        if not slots:
            pytest.skip("no free slot for kavya")
        b = meera.post(f"{BASE_URL}/api/counselling/bookings", json={"note": "TEST_request"})
        assert b.status_code == 200 and b.json()["status"] == "pending"
        bid = b.json()["id"]
        try:
            time.sleep(1.5)
            req = list(DB.notification_log.find({"key": {"$regex": f"^session_booked:{bid}:req:pending"}}, {"_id": 0}))
            assert len(req) == 6
            u = kavya.patch(f"{BASE_URL}/api/counsellor/bookings/{bid}", json={"slot_id": slots[0]["id"]})
            assert u.status_code == 200 and u.json()["status"] == "confirmed"
            time.sleep(1.5)
            conf = list(DB.notification_log.find({"key": {"$regex": f"^session_booked:{bid}:{slots[0]['id']}:confirmed"}}, {"_id": 0}))
            assert {r["user_id"] for r in conf} == {"stu-meera", "cou-kavya"}
        finally:
            c = kavya.patch(f"{BASE_URL}/api/counsellor/bookings/{bid}", json={"status": "cancelled"})
        assert c.status_code == 200
        time.sleep(1.5)
        can = list(DB.notification_log.find({"key": {"$regex": f"^session_cancelled:{bid}"}}, {"_id": 0}))
        assert {r["user_id"] for r in can} == {"stu-meera", "cou-kavya"}
        assert "Dr. Kavya" in next(r for r in can if r["user_id"] == "stu-meera")["body"]
        assert DB.slots.find_one({"id": slots[0]["id"]})["booked_by"] is None


class TestCron:
    def test_sweep_auth(self):
        r, _ = cron("notify-sweep", auth=False)
        assert r.status_code == 401
        r, _ = cron("reminders", auth=False)
        assert r.status_code == 401

    def test_sweep_fast_and_idempotent(self):
        before = DB.notification_log.count_documents({"event": {"$in": ["week1_unlocked", "week2_unlocked"]}, "test": False})
        wid = f"TEST_{uuid.uuid4()}"
        r, dt = cron("notify-sweep", wid=wid)
        assert r.status_code == 200 and r.json()["accepted"] == wid and dt < 5
        r2, _ = cron("notify-sweep", wid=wid)
        assert r2.json().get("duplicate") is True
        time.sleep(3)
        after = DB.notification_log.count_documents({"event": {"$in": ["week1_unlocked", "week2_unlocked"]}, "test": False})
        assert after == before
        for k in ("week1", "week2"):
            for key in DB.notification_log.distinct("key", {"event": f"{k}_unlocked", "test": False}):
                assert DB.notification_log.count_documents({"key": key}) == 3

    def test_session_reminder(self):
        sid, bid = f"TEST_slot_{uuid.uuid4()}", f"TEST_bk_{uuid.uuid4()}"
        start = (datetime.now(timezone.utc) + timedelta(minutes=40)).isoformat()
        DB.slots.insert_one({"id": sid, "counsellor_id": "cou-kavya", "start": start, "minutes": 30, "mode": "video", "booked_by": "stu-meera", "booking_id": bid, "removed": True})
        DB.bookings.insert_one({"id": bid, "student_id": "stu-meera", "counsellor_id": "cou-kavya", "slot_id": sid, "kind": "slot", "status": "confirmed",
                                "note": "TEST", "created_at": datetime.now(timezone.utc).isoformat()})
        try:
            r, _ = cron("notify-sweep")
            assert r.status_code == 200
            rows = wait_log({"key": {"$regex": f"^remind:{bid}"}})
            time.sleep(1)
            rows = list(DB.notification_log.find({"key": {"$regex": f"^remind:{bid}"}}, {"_id": 0}))
            assert {r["user_id"] for r in rows} == {"stu-meera", "cou-kavya"} and len(rows) == 6
            cron("notify-sweep")
            time.sleep(2)
            assert DB.notification_log.count_documents({"key": {"$regex": f"^remind:{bid}"}}) == 6
        finally:
            DB.slots.delete_one({"id": sid})
            DB.bookings.delete_one({"id": bid})
            DB.notification_log.delete_many({"key": {"$regex": f"^remind:{bid}"}})
            DB.notifications.delete_many({"key": {"$regex": f"^remind:{bid}"}})

    def test_reminders_endpoint(self):
        r, dt = cron("reminders")
        assert r.status_code == 200 and dt < 5
        time.sleep(3)
        # every student with a pending check-in should have a log entry for today's slot key
        today = datetime.now(timezone(timedelta(hours=5, minutes=30))).date().isoformat()
        rows = list(DB.notification_log.find({"event": "checkin_reminder", "key": {"$regex": f":{today}:"}}, {"_id": 0}))
        print("checkin rows today:", len(rows), {(r["user_id"], r["channel"], r["status"]) for r in rows})
        assert rows


class TestLowMood:
    RID = "7728256e-217b-4651-9f71-38d521975d56"

    def test_low_mood_alert(self, meera):
        rep = meera.get(f"{BASE_URL}/api/reports/{self.RID}")
        assert rep.status_code == 200
        moods = rep.json().get("moods") or {}
        assert moods
        r = meera.patch(f"{BASE_URL}/api/reports/{self.RID}/progress", json={"moods": moods})
        assert r.status_code == 200
        today = datetime.now(timezone(timedelta(hours=5, minutes=30))).date().isoformat()
        rows = wait_log({"key": f"low_mood:stu-meera:cou-kavya:{today}"})
        assert len(rows) == 3
        meera.patch(f"{BASE_URL}/api/reports/{self.RID}/progress", json={"moods": moods})
        time.sleep(1.5)
        assert DB.notification_log.count_documents({"key": f"low_mood:stu-meera:cou-kavya:{today}"}) == 3
        assert meera.get(f"{BASE_URL}/api/reports/{self.RID}").json()["moods"] == moods
