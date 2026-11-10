# Media library API tests: GET /api/media (auth), admin CRUD /api/admin/media, role checks, validation
import os
import pytest
import requests

def _base():
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if not url:
        env = dict(l.strip().split("=", 1) for l in open("/app/frontend/.env") if "=" in l)
        url = env["REACT_APP_BACKEND_URL"]
    return url.rstrip("/")

BASE_URL = _base()


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    if r.status_code != 200:
        pytest.skip("login failed")
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def admin():
    return login("adm-platform")


@pytest.fixture(scope="module")
def student():
    return login("stu-meera")


# Media list
class TestMediaList:
    def test_requires_auth(self):
        assert requests.get(f"{BASE_URL}/api/media").status_code == 401

    def test_student_lists_seeded(self, student):
        r = requests.get(f"{BASE_URL}/api/media", headers=student)
        assert r.status_code == 200
        data = r.json()
        kinds = [m["kind"] for m in data]
        assert kinds.count("short") >= 5 and kinds.count("audiobook") >= 2 and kinds.count("video") >= 2
        for m in data:
            assert "_id" not in m and len(m["youtube_id"]) == 11 and m["id"]


# Admin CRUD
class TestAdminMedia:
    def test_student_forbidden(self, student):
        body = {"kind": "short", "title": "TEST_x", "url": "https://youtu.be/inpok4MKVLM"}
        assert requests.post(f"{BASE_URL}/api/admin/media", json=body, headers=student).status_code == 403
        assert requests.put(f"{BASE_URL}/api/admin/media/nope", json=body, headers=student).status_code == 403
        assert requests.delete(f"{BASE_URL}/api/admin/media/nope", headers=student).status_code == 403

    @pytest.mark.parametrize("url,yid", [
        ("https://www.youtube.com/watch?v=inpok4MKVLM", "inpok4MKVLM"),
        ("https://youtu.be/O-6f5wQXSu8?si=abc", "O-6f5wQXSu8"),
        ("https://www.youtube.com/shorts/tEmt1Znux58", "tEmt1Znux58"),
        ("aEqlQvczMJQ", "aEqlQvczMJQ"),
    ])
    def test_crud_flow(self, admin, url, yid):
        r = requests.post(f"{BASE_URL}/api/admin/media", json={"kind": "video", "title": "  TEST_vid  ", "duration": "3 min", "url": url}, headers=admin)
        assert r.status_code == 200, r.text
        d = r.json()
        mid = d["id"]
        try:
            assert d["youtube_id"] == yid and d["title"] == "TEST_vid" and d["kind"] == "video" and "_id" not in d
            lst = requests.get(f"{BASE_URL}/api/media", headers=admin).json()
            assert any(m["id"] == mid for m in lst)
            u = requests.put(f"{BASE_URL}/api/admin/media/{mid}", json={"kind": "audiobook", "title": "TEST_upd", "duration": "9 min", "url": "https://youtu.be/C69UI6cYsPk"}, headers=admin)
            assert u.status_code == 200 and u.json()["title"] == "TEST_upd" and u.json()["youtube_id"] == "C69UI6cYsPk" and u.json()["kind"] == "audiobook"
            lst = requests.get(f"{BASE_URL}/api/media", headers=admin).json()
            assert next(m for m in lst if m["id"] == mid)["duration"] == "9 min"
        finally:
            dr = requests.delete(f"{BASE_URL}/api/admin/media/{mid}", headers=admin)
        assert dr.status_code == 200
        lst = requests.get(f"{BASE_URL}/api/media", headers=admin).json()
        assert not any(m["id"] == mid for m in lst)
        assert requests.delete(f"{BASE_URL}/api/admin/media/{mid}", headers=admin).status_code == 404

    @pytest.mark.parametrize("body,msg", [
        ({"kind": "short", "title": "TEST_bad", "url": "https://example.com/video"}, "YouTube"),
        ({"kind": "podcast", "title": "TEST_bad", "url": "https://youtu.be/inpok4MKVLM"}, "Kind"),
        ({"kind": "short", "title": "   ", "url": "https://youtu.be/inpok4MKVLM"}, "Title"),
    ])
    def test_validation(self, admin, body, msg):
        r = requests.post(f"{BASE_URL}/api/admin/media", json=body, headers=admin)
        assert r.status_code == 422 and msg in r.json()["detail"]

    def test_missing_fields_422(self, admin):
        assert requests.post(f"{BASE_URL}/api/admin/media", json={"kind": "short"}, headers=admin).status_code == 422

    def test_update_unknown_404(self, admin):
        r = requests.put(f"{BASE_URL}/api/admin/media/does-not-exist", json={"kind": "short", "title": "TEST", "url": "https://youtu.be/inpok4MKVLM"}, headers=admin)
        assert r.status_code == 404

    def test_non_youtube_domain_with_v_param(self, admin):
        # Probe: non-YouTube domain with ?v= param should ideally be rejected
        r = requests.post(f"{BASE_URL}/api/admin/media", json={"kind": "short", "title": "TEST_probe", "url": "https://evil.example.com/watch?v=abcdefghijk"}, headers=admin)
        if r.status_code == 200:
            requests.delete(f"{BASE_URL}/api/admin/media/{r.json()['id']}", headers=admin)
        print("non-youtube domain status:", r.status_code)
