# MindEdge programme (Grades 9-10) tests: demo users, admin content, shared school counsellors, report scoping, check-in
import os
import re
from collections import Counter
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
RIYA_R = "699718d5-8527-4482-adfb-4e842191cf5b"
AARAV_R = "3520670c-55b6-41c6-8458-f5bbb8b95f94"
ROHAN_R = "d80e237a-a80c-452c-90cc-0a658c4d5a94"
ME_AREAS = ["Academic Stress & Study Habits", "Parental & Family Context", "Peer Pressure & Social Acceptance",
            "Self-Esteem & Confidence", "Emotional Regulation", "Digital & Social Media Stress"]
SCHOOL = {"mm-aarav", "mm-diya", "mm-kabir", "me-riya", "me-arjun", "me-sana"}


def login(uid):
    r = requests.post(f"{BASE_URL}/api/auth/demo-login", json={"user_id": uid})
    assert r.status_code == 200, r.text
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s, r.json()["user"]


@pytest.fixture(scope="module")
def admin():
    return login("adm-platform")[0]


# --- demo users
def test_demo_users_me():
    ids = {u["id"]: u for u in requests.get(f"{BASE_URL}/api/auth/demo-users").json()}
    for i in ("me-riya", "me-arjun", "me-sana", "me-rahul"):
        assert ids[i]["programme"] == "mindedge"
    assert ids["me-rahul"]["role"] == "counsellor"


# --- admin content
def test_admin_items_me(admin):
    d = admin.get(f"{BASE_URL}/api/admin/items?programme=mindedge").json()
    assert len(d["items"]) == 180
    assert [a["name"] for a in d["areas"]] == ME_AREAS
    assert len(d["subthemes"]) == 24
    c = Counter(i["area"] for i in d["items"])
    assert all(c[k] == 30 for k in "ABCDEF")


def test_admin_activities_me(admin):
    me = admin.get(f"{BASE_URL}/api/admin/activities?programme=mindedge").json()
    ids = {a["id"] for a in me}
    assert {"e-parent", "e-onefriend", "e-3wins", "e-socialfast"} <= ids
    assert all(a["area_name"] in ME_AREAS for a in me)


def test_admin_stats_me(admin):
    d = admin.get(f"{BASE_URL}/api/admin/stats?programme=mindedge").json()
    print(d)
    if not d.get("suppressed"):
        assert [a["name"] for a in d["areas"]] == ME_AREAS


def test_product_doc_me(admin):
    md = admin.get(f"{BASE_URL}/api/admin/product-doc?programme=mindedge").json()["markdown"]
    assert "MindEdge" in md
    assert "Digital & Social Media Stress" in md
    assert len(set(re.findall(r"\b[A-F]\d-\d\d\b", md))) == 180


# --- Riya's report content
def test_riya_report():
    s, _ = login("me-riya")
    r = s.get(f"{BASE_URL}/api/reports/{RIYA_R}")
    assert r.status_code == 200
    d = r.json()
    assert d["programme"] == "mindedge"
    assert [a["name"] for a in d["areas"]] == ME_AREAS
    assert [x["to"] for x in d["scripts"]] == ["To a parent", "To a class teacher", "To one safe classmate"]
    assert "MindEdge" in d["version"]


# --- shared school counsellors
@pytest.mark.parametrize("cid", ["mm-neha", "me-rahul"])
def test_school_counsellor_students(cid):
    s, _ = login(cid)
    r = s.get(f"{BASE_URL}/api/counsellor/students")
    assert r.status_code == 200, r.text
    d = r.json()
    rows = d if isinstance(d, list) else d.get("students", [])
    ids = {x["student"]["id"] for x in rows}
    print(cid, ids)
    assert SCHOOL <= ids
    assert not any(i.startswith("stu-") for i in ids)
    for rid in (RIYA_R, AARAV_R):
        assert s.get(f"{BASE_URL}/api/reports/{rid}").status_code == 200
    assert s.get(f"{BASE_URL}/api/reports/{ROHAN_R}").status_code == 404


@pytest.mark.parametrize("cid", ["mm-neha", "me-rahul"])
def test_school_counsellor_student_detail(cid):
    s, _ = login(cid)
    for uid in ("me-riya", "me-arjun", "mm-aarav"):
        r = s.get(f"{BASE_URL}/api/counsellor/students/{uid}")
        assert r.status_code == 200, f"{cid}->{uid}: {r.status_code} {r.text[:200]}"
    assert s.get(f"{BASE_URL}/api/counsellor/students/stu-rohan").status_code == 404


def test_kavya_scoped():
    s, _ = login("cou-kavya")
    d = s.get(f"{BASE_URL}/api/counsellor/students").json()
    rows = d if isinstance(d, list) else d.get("students", [])
    ids = {x["student"]["id"] for x in rows}
    assert not (ids & SCHOOL)
    assert s.get(f"{BASE_URL}/api/reports/{RIYA_R}").status_code == 404
    assert s.get(f"{BASE_URL}/api/counsellor/students/me-riya").status_code == 404


def test_me_student_slots_school_only():
    s, _ = login("me-sana")
    r = s.get(f"{BASE_URL}/api/counselling/slots")
    print(r.status_code, str(r.json())[:400])
    assert r.status_code == 200
    assert "Kavya" not in r.text


def test_admin_forbidden_for_me_student():
    s, _ = login("me-arjun")
    assert s.get(f"{BASE_URL}/api/admin/items?programme=mindedge").status_code == 403


# --- check-in start (does not submit; reuses in-progress assessment if any)
def test_checkin_start_me_bank():
    s, _ = login("me-sana")
    d = s.post(f"{BASE_URL}/api/assessments/start").json()
    items = d["items"]
    assert len(items) == 24
    c = Counter(i["area"] for i in items)
    assert all(c[k] == 4 for k in "ABCDEF"), c
    assert all(i["area_name"] in ME_AREAS for i in items)
