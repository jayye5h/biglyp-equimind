# Games library (admin catalogue, on/off toggle, student enabled list, wellness/today game pick)
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
IDS = ["sudoku", "memory", "zerokata", "bubble-pop", "breath-balloon", "gratitude-jar", "odd-colour", "word-scramble",
       "simon", "worry-clouds", "kindness-cards", "slide-puzzle", "reaction-tap", "quick-sums", "word-search",
       "lights-out", "catch-stars", "affirmation", "zen-sand", "guess-word", "grounding", "steady-beat",
       "pattern-recall", "higher-lower", "rps", "count-shapes"]
STUDENT = ["sudoku", "memory", "zerokata"]


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200, r.text
    tok = r.json().get("token") or r.json().get("access_token")
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {tok}"})
    return s


@pytest.fixture(scope="module")
def admin():
    return login("adm-platform")


@pytest.fixture(scope="module")
def student():
    return login("stu-rohan")


@pytest.fixture(scope="module", autouse=True)
def restore_all_on(admin):
    yield
    for gid in IDS:
        admin.patch(f"{BASE_URL}/api/admin/games/{gid}", json={"enabled": True})


class TestCatalogue:
    def test_admin_list_26(self, admin):
        r = admin.get(f"{BASE_URL}/api/admin/games")
        assert r.status_code == 200
        data = r.json()
        assert [g["id"] for g in data] == IDS
        assert sorted(g["id"] for g in data if g.get("student")) == sorted(STUDENT)
        for g in data:
            assert g["type"] in ["Calm", "Focus", "Mood lift", "Playful"]
            assert set(g["areas"]) <= set("ABCDEF") and g["areas"]
            assert set(g["moods"]) <= {0, 1, 2, 3, 4} and g["moods"]
            assert isinstance(g["enabled"], bool)
            assert "_id" not in g

    def test_student_forbidden(self, student):
        assert student.get(f"{BASE_URL}/api/admin/games").status_code == 403
        assert student.patch(f"{BASE_URL}/api/admin/games/memory", json={"enabled": False}).status_code == 403

    def test_counsellor_forbidden(self):
        assert login("cou-kavya").get(f"{BASE_URL}/api/admin/games").status_code == 403

    def test_unauth(self):
        assert requests.get(f"{BASE_URL}/api/admin/games").status_code in (401, 403)
        assert requests.get(f"{BASE_URL}/api/games/enabled").status_code in (401, 403)

    def test_unknown_404(self, admin):
        r = admin.patch(f"{BASE_URL}/api/admin/games/nope", json={"enabled": False})
        assert r.status_code == 404

    def test_invalid_body_422(self, admin):
        r = admin.patch(f"{BASE_URL}/api/admin/games/memory", json={})
        assert r.status_code == 422


class TestToggle:
    def test_memory_off_then_on(self, admin, student):
        r = admin.patch(f"{BASE_URL}/api/admin/games/memory", json={"enabled": False})
        assert r.status_code == 200 and r.json() == {"id": "memory", "enabled": False}
        lst = {g["id"]: g["enabled"] for g in admin.get(f"{BASE_URL}/api/admin/games").json()}
        assert lst["memory"] is False
        en = student.get(f"{BASE_URL}/api/games/enabled").json()
        assert "memory" not in en and set(en) <= set(STUDENT)
        for _ in range(3):
            g = student.get(f"{BASE_URL}/api/wellness/today").json()["game"]
            assert g is None or g["id"] != "memory"
        admin.patch(f"{BASE_URL}/api/admin/games/memory", json={"enabled": True})
        assert "memory" in student.get(f"{BASE_URL}/api/games/enabled").json()

    def test_non_student_game_off_doesnt_affect_enabled(self, admin, student):
        admin.patch(f"{BASE_URL}/api/admin/games/rps", json={"enabled": False})
        assert sorted(student.get(f"{BASE_URL}/api/games/enabled").json()) == sorted(STUDENT)
        lst = {g["id"]: g["enabled"] for g in admin.get(f"{BASE_URL}/api/admin/games").json()}
        assert lst["rps"] is False
        admin.patch(f"{BASE_URL}/api/admin/games/rps", json={"enabled": True})

    def test_all_student_games_off(self, admin, student):
        for gid in STUDENT:
            assert admin.patch(f"{BASE_URL}/api/admin/games/{gid}", json={"enabled": False}).status_code == 200
        assert student.get(f"{BASE_URL}/api/games/enabled").json() == []
        r = student.get(f"{BASE_URL}/api/wellness/today")
        assert r.status_code == 200
        d = r.json()
        assert d["game"] is None and d["exercise"]["name"]
        # other students too
        for uid in ["stu-ananya", "stu-meera"]:
            r2 = login(uid).get(f"{BASE_URL}/api/wellness/today")
            assert r2.status_code == 200 and r2.json()["game"] is None
        for gid in STUDENT:
            admin.patch(f"{BASE_URL}/api/admin/games/{gid}", json={"enabled": True})
        assert student.get(f"{BASE_URL}/api/wellness/today").json()["game"]["id"] in STUDENT
