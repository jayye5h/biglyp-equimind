import random
from content import AREAS, SUBTHEMES, ITEMS, THEORY, ACTIVITIES, FATIGUE_ITEMS, AREA_BY_KEY


def pick_items(seed: int, exclude: set) -> list:
    rng = random.Random(seed)
    picked = []
    for skey in SUBTHEMES:
        pool = [i for i in ITEMS if ITEMS[i]["subtheme"] == skey and i not in exclude]
        picked.append(rng.choice(pool))
    rng.shuffle(picked)
    return picked


def level_for(score: int) -> str:
    if score < 35:
        return "Needs care first"
    if score < 50:
        return "Watch"
    if score < 65:
        return "Steady"
    return "Strength"


def score_responses(item_ids: list, responses: dict) -> dict:
    areas = []
    for a in AREAS:
        ids = [i for i in item_ids if ITEMS[i]["area"] == a["key"]]
        raw = sum(responses[i] for i in ids)
        high = sum(1 for i in ids if responses[i] >= 3)
        score = round(100 - (raw / 16) * 100)
        areas.append({"key": a["key"], "name": a["name"], "short": a["short"], "raw": raw,
                      "high_count": high, "score": score, "level": level_for(score)})
    overall = round(sum(a["score"] for a in areas) / 6)
    ranked = sorted(areas, key=lambda a: (a["score"], -a["high_count"]))
    priorities = [a["key"] for a in ranked[:3]]
    resources = [a["key"] for a in sorted(areas, key=lambda a: -a["score"]) if a["key"] not in priorities][:2]
    path = 2 if (any(a["score"] < 35 for a in areas) or overall < 45) else 1
    by = {a["key"]: a for a in areas}
    fatigue_high = sum(1 for i in item_ids if i in FATIGUE_ITEMS and responses[i] >= 3)
    body_page = by["B"]["score"] < 50 or by["C"]["score"] < 55 or fatigue_high >= 3 or path == 2
    high_items = [ITEMS[i]["text"] for i in sorted(item_ids, key=lambda i: -responses[i]) if responses[i] >= 3]
    return {"areas": areas, "overall": overall, "priorities": priorities, "resources": resources,
            "path": path, "body_page": body_page, "high_items": high_items[:8], "fatigue_high": fatigue_high}


def priority_pages(result: dict, item_ids: list, responses: dict) -> list:
    by = {a["key"]: a for a in result["areas"]}
    pages = []
    for k in result["priorities"]:
        acts = ACTIVITIES[k][:2]
        if k == "D":
            breakup = any(responses[i] >= 3 for i in item_ids if ITEMS[i]["subtheme"] == "D3")
            acts = [ACTIVITIES["D"][0], ACTIVITIES["D"][1] if breakup else ACTIVITIES["D"][2]]
        pages.append({"area": k, "name": AREA_BY_KEY[k]["name"], "score": by[k]["score"],
                      "level": by[k]["level"], "theory": THEORY[k], "activities": acts})
    return pages


def build_plan(pages: list) -> list:
    plan, seen = [], set()

    def add(a):
        if a["id"] not in seen and len(plan) < 5:
            seen.add(a["id"])
            plan.append(a)

    b_lookup = {a["id"]: a for a in ACTIVITIES["B"]}
    c_lookup = {a["id"]: a for a in ACTIVITIES["C"]}
    add(b_lookup["b-wake"])
    for p in pages:
        add(p["activities"][0])
    add(c_lookup["c-checkin"])
    for fallback in (b_lookup["b-dump"], b_lookup["b-phone"], ACTIVITIES["A"][1], c_lookup["c-breath"]):
        add(fallback)
    return plan


def body_pattern(result: dict) -> str:
    by = {a["key"]: a for a in result["areas"]}
    bits = [f"Body & Sleep {by['B']['score']}"]
    if result["fatigue_high"] >= 1:
        bits.append("often tired or foggy")
    if by["C"]["score"] < 55:
        bits.append(f"Emotional {by['C']['score']}")
    return ", ".join(bits)
