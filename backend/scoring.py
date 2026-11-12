import random
import content as EQ


def pick_items(seed: int, exclude: set, C=EQ) -> list:
    rng = random.Random(seed)
    picked = []
    for skey in C.SUBTHEMES:
        pool = [i for i in C.ITEMS if C.ITEMS[i]["subtheme"] == skey and i not in exclude]
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


def score_responses(item_ids: list, responses: dict, C=EQ) -> dict:
    areas = []
    for a in C.AREAS:
        ids = [i for i in item_ids if C.ITEMS[i]["area"] == a["key"]]
        raw = sum(responses[i] for i in ids)
        high = sum(1 for i in ids if responses[i] >= 3)
        score = round(100 - (raw / 16) * 100)
        areas.append({"key": a["key"], "name": a["name"], "short": a["short"], "raw": raw,
                      "high_count": high, "score": score, "level": level_for(score)})
    overall = round(sum(a["score"] for a in areas) / 6)
    ranked = sorted(areas, key=lambda a: (a["score"], -a["high_count"]))
    priorities = [a["key"] for a in ranked[:3]]
    resources = [a["key"] for a in sorted(areas, key=lambda a: -a["score"]) if a["key"] not in priorities and a["score"] >= 50][:2]
    path = 2 if (any(a["score"] < 35 for a in areas) or overall < 45) else 1
    by = {a["key"]: a for a in areas}
    fatigue_high = sum(1 for i in item_ids if i in C.FATIGUE_ITEMS and responses[i] >= 3)
    body_page = by[C.BODY_AREA]["score"] < 50 or by[C.EMO_AREA]["score"] < 55 or fatigue_high >= 3 or path == 2
    high_items = [C.ITEMS[i]["text"] for i in sorted(item_ids, key=lambda i: -responses[i]) if responses[i] >= 3]
    return {"areas": areas, "overall": overall, "priorities": priorities, "resources": resources,
            "path": path, "body_page": body_page, "high_items": high_items[:8], "fatigue_high": fatigue_high}


def priority_pages(result: dict, item_ids: list, responses: dict, C=EQ) -> list:
    by = {a["key"]: a for a in result["areas"]}
    pages = []
    for k in result["priorities"]:
        acts = C.ACTIVITIES[k][:2]
        if k == "D":
            breakup = any(responses[i] >= 3 for i in item_ids if C.ITEMS[i]["subtheme"] == "D3")
            acts = [C.ACTIVITIES["D"][0], C.ACTIVITIES["D"][1] if breakup else C.ACTIVITIES["D"][2]]
        pages.append({"area": k, "name": C.AREA_BY_KEY[k]["name"], "score": by[k]["score"],
                      "level": by[k]["level"], "theory": C.THEORY[k], "activities": acts})
    return pages


def build_plan(pages: list, C=EQ) -> list:
    plan, seen = [], set()

    def add(a):
        if a["id"] not in seen and len(plan) < 5:
            seen.add(a["id"])
            plan.append(a)

    add(C.act(C.PLAN_START))
    for p in pages:
        add(p["activities"][0])
    add(C.act(C.PLAN_CHECKIN))
    for fid in C.PLAN_FILLERS:
        add(C.act(fid))
    return plan


def body_pattern(result: dict, C=EQ) -> str:
    by = {a["key"]: a for a in result["areas"]}
    b, e = by[C.BODY_AREA], by[C.EMO_AREA]
    bits = [f"{b['name'].split(',')[0]} {b['score']}"]
    if result["fatigue_high"] >= 1:
        bits.append("often tired or foggy")
    if e["score"] < 55:
        bits.append(f"Emotional {e['score']}")
    return ", ".join(bits)
