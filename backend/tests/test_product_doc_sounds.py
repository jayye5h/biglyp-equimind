# Iteration 18: Product Document API (admin only) + locally-hosted soothing sounds
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
SOUND_IDS = ["guitar", "birds", "night", "flute", "train", "study", "code", "meditation",
             "singing-bowl", "cafe", "waves", "campfire", "rain", "forest", "thunderstorm"]


def _token(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid}, timeout=20)
    if r.status_code != 200:
        pytest.skip(f"login failed for {uid}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_doc():
    r = requests.get(f"{BASE_URL}/api/admin/product-doc",
                     headers={"Authorization": f"Bearer {_token('adm-platform')}"}, timeout=30)
    assert r.status_code == 200
    return r.json()


# Product doc: access control
class TestProductDocAccess:
    def test_unauthenticated_401(self):
        r = requests.get(f"{BASE_URL}/api/admin/product-doc", timeout=20)
        assert r.status_code == 401

    @pytest.mark.parametrize("uid", ["stu-ananya", "cou-kavya"])
    def test_non_admin_403(self, uid):
        r = requests.get(f"{BASE_URL}/api/admin/product-doc",
                         headers={"Authorization": f"Bearer {_token(uid)}"}, timeout=20)
        assert r.status_code == 403


# Product doc: content
class TestProductDocContent:
    def test_shape(self, admin_doc):
        assert isinstance(admin_doc["markdown"], str) and len(admin_doc["markdown"]) > 10000
        assert isinstance(admin_doc["generated_at"], str)

    def test_18_sections(self, admin_doc):
        h2 = re.findall(r"^## (\d+)\. ", admin_doc["markdown"], re.M)
        assert [int(x) for x in h2] == list(range(1, 19))

    def test_180_items(self, admin_doc):
        ids = re.findall(r"^- `([A-F]\d-\d{2})`", admin_doc["markdown"], re.M)
        assert len(ids) == 180 and len(set(ids)) == 180
        assert "A1-01" in ids

    def test_counts_and_rules(self, admin_doc):
        md = admin_doc["markdown"]
        assert "## 5. Question bank (180 statements)" in md
        assert "## 10. Activity library (26 activities)" in md
        assert "## 14. Games library (26 games)" in md
        assert "round(100 − raw ÷ 16 × 100)" in md
        assert "< 35 **Needs care first** · 35–49 **Watch** · 50–64 **Steady** · 65+ **Strength**" in md
        assert "any area < 35 or overall < 45" in md

    def test_notifications_table_7_rows(self, admin_doc):
        sec = admin_doc["markdown"].split("## 15. Notifications")[1].split("## 16.")[0]
        rows = [l for l in sec.splitlines() if l.startswith("| ") and not l.startswith("| Notification")]
        assert len(rows) == 7


# Sounds: local mp3 files
class TestSounds:
    @pytest.mark.parametrize("sid", SOUND_IDS)
    def test_sound_file(self, sid):
        r = requests.get(f"{BASE_URL}/sounds/{sid}.mp3", headers={"Range": "bytes=0-1023"}, timeout=30)
        assert r.status_code in (200, 206)
        assert "audio/mpeg" in r.headers.get("content-type", "")
