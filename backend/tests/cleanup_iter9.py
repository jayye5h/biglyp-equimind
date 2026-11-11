# Cleanup helper: cancel non-seeded (Rohan/Meera) bookings created during testing; leaves Ananya's seeded booking
import requests
from dotenv import dotenv_values

B = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")


def tok(uid):
    return {"Authorization": "Bearer " + requests.post(f"{B}/api/auth/demo-login", json={"user_id": uid}).json()["token"]}


k = tok("cou-kavya")
for b in requests.get(f"{B}/api/counsellor/sessions", headers=k).json():
    if b["student_id"] != "stu-ananya" and b["status"] != "cancelled":
        r = requests.patch(f"{B}/api/counsellor/bookings/{b['id']}", json={"status": "cancelled"}, headers=k)
        print("cancelled", b["id"], b["status"], r.status_code)
print("ananya notifs:", [n["title"] for n in requests.get(f"{B}/api/notifications", headers=tok("stu-ananya")).json()])
print("open slots:", len(requests.get(f"{B}/api/counselling/slots", headers=tok("stu-rohan")).json()))
