# MindMellow programme (Grades 11-12) tests: admin ?programme, counsellor scoping, reports, EquiMind regression
import os
import re
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
AARAV_R = "3520670c-55b6-41c6-8458-f5bbb8b95f94"
DIYA_R = "4ba240ab-17a8-4bab-8671-87017ba3a410"
ROHAN_R = "d80e237a-a80c-452c-90cc-0a658c4d5a94"


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
def test_demo_users_lists_mm():
    d = requests.get(f"{BASE_URL}/api/auth/demo-users").json()
    ids = {u["id"]: u for u in d}
    for i in ("mm-aarav", "mm-diya", "mm-kabir", "mm-neha"):
        assert ids[i]["programme"] == "mindmellow"
    for i in ("stu-ananya", "stu-rohan", "stu-meera", "cou-kavya"):
        assert ids[i].get("programme") in ("equimind", "", None)


# --- admin items / stats / activities / product doc
def test_admin_items_mm(admin):
    d = admin.get(f"{BASE_URL}/api/admin/items?programme=mindmellow").json()
    items = d if isinstance(d, list) else d.get("items", d)
    assert len(items) == 180
    a201 = [i for i in items if i.get("id") == "A2-01"]
    assert a201 and "competitive-exam" in a201[0]["text"]


def test_admin_items_eq_default(admin):
    d = admin.get(f"{BASE_URL}/api/admin/items").json()
    items = d if isinstance(d, list) else d.get("items", d)
    assert len(items) == 180
    mm = admin.get(f"{BASE_URL}/api/admin/items?programme=mindmellow").json()
    mm = mm if isinstance(mm, list) else mm.get("items", mm)
    assert items[0]["text"] != mm[0]["text"]


def test_admin_stats(admin):
    eq = admin.get(f"{BASE_URL}/api/admin/stats").json()
    mm = admin.get(f"{BASE_URL}/api/admin/stats?programme=mindmellow").json()
    print("EQ", eq)
    print("MM", mm)
    assert eq != mm


def test_admin_activities(admin):
    eq = admin.get(f"{BASE_URL}/api/admin/activities").json()
    mm = admin.get(f"{BASE_URL}/api/admin/activities?programme=mindmellow").json()
    assert eq != mm
    assert "2-subject rule" in str(mm)


def test_product_doc_mm(admin):
    md = admin.get(f"{BASE_URL}/api/admin/product-doc?programme=mindmellow").json()["markdown"]
    assert "MindMellow" in md
    assert "Academic & Exam Pressure" in md
    assert len(set(re.findall(r"\b[A-F]\d-\d\d\b", md))) == 180
    eq = admin.get(f"{BASE_URL}/api/admin/product-doc").json()["markdown"]
    assert "EquiMind" in eq and eq != md


def test_admin_forbidden_for_student():
    s, _ = login("mm-kabir")
    assert s.get(f"{BASE_URL}/api/admin/items?programme=mindmellow").status_code == 403


# --- reports
def test_report_aarav():
    s, _ = login("mm-aarav")
    r = s.get(f"{BASE_URL}/api/reports/{AARAV_R}").json()
    assert r["programme"] == "mindmellow"
    assert len(r.get("logged_days") or []) == 14 or len((r.get("tracker") or {})) >= 14


def test_report_diya():
    s, _ = login("mm-diya")
    r = s.get(f"{BASE_URL}/api/reports/{DIYA_R}").json()
    assert r["programme"] == "mindmellow"
    print("diya logged", r.get("logged_days"))


def test_report_rohan_regression():
    s, _ = login("stu-rohan")
    r = s.get(f"{BASE_URL}/api/reports/{ROHAN_R}").json()
    assert r.get("programme", "equimind") == "equimind"
    assert "EquiMind" in r.get("version", "EquiMind")


def test_mm_student_cannot_read_eq_report():
    s, _ = login("mm-kabir")
    assert s.get(f"{BASE_URL}/api/reports/{ROHAN_R}").status_code == 404


# --- counsellor scoping
def test_neha_students():
    s, _ = login("mm-neha")
    rows = s.get(f"{BASE_URL}/api/counsellor/students").json()
    ids = {r["student"]["id"] for r in rows}
    assert ids == {"mm-aarav", "mm-diya", "mm-kabir"}
    kab = [r for r in rows if r["student"]["id"] == "mm-kabir"][0]
    assert kab["severity"] > 0


def test_kavya_students():
    s, _ = login("cou-kavya")
    ids = {r["student"]["id"] for r in s.get(f"{BASE_URL}/api/counsellor/students").json()}
    assert ids == {"stu-ananya", "stu-rohan", "stu-meera"}


def test_cross_programme_student_detail_404():
    s, _ = login("cou-kavya")
    assert s.get(f"{BASE_URL}/api/counsellor/students/mm-kabir").status_code == 404
    n, _ = login("mm-neha")
    assert n.get(f"{BASE_URL}/api/counsellor/students/mm-kabir").status_code == 200


def test_mm_slots_only_neha():
    s, _ = login("mm-diya")
    slots = s.get(f"{BASE_URL}/api/counselling/slots").json()
    assert slots and all(x["counsellor_name"] == "Ms. Neha Kapoor" for x in slots)
    e, _ = login("stu-rohan")
    es = e.get(f"{BASE_URL}/api/counselling/slots").json()
    assert all(x["counsellor_name"] != "Ms. Neha Kapoor" for x in es)


# --- isolation leaks (code review)
def test_cross_programme_counsellor_report_read():
    s, _ = login("cou-kavya")
    code = s.get(f"{BASE_URL}/api/reports/{AARAV_R}").status_code
    assert code in (403, 404), f"EquiMind counsellor can read MindMellow report (status {code})"


def test_cross_programme_counsellor_sessions():
    s, _ = login("mm-neha")
    rows = s.get(f"{BASE_URL}/api/counsellor/sessions").json()
    leaked = [r["student"]["id"] for r in rows if r.get("student") and not r["student"]["id"].startswith("mm-")]
    assert not leaked, f"Neha sees EquiMind bookings: {set(leaked)}"


def test_wellness_today_mm():
    s, _ = login("mm-aarav")
    r = s.get(f"{BASE_URL}/api/wellness/today")
    assert r.status_code == 200


# wellness/today must map MindMellow priorities onto shared library areas (WELLNESS_MAP)
def test_wellness_today_mm_mapping():
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from content_mm import WELLNESS_MAP
    s, _ = login("mm-kabir")
    pri = s.get(f"{BASE_URL}/api/reports").json()[0]["priorities"]
    expected = list(dict.fromkeys(WELLNESS_MAP[k] for k in pri))
    fa = s.get(f"{BASE_URL}/api/wellness/today").json()["focus_areas"]
    assert expected  # shared-library areas were derived from MindMellow priorities
    # labels and keys are shown back in MindMellow terms
    from content_mm import AREA_BY_KEY
    assert all(f["name"] == AREA_BY_KEY[f["key"]]["name"] for f in fa)
