"""Why each plan activity helps (shown in the 14-day plan section) and next-step activity suggestions."""
from content import ACTIVITIES

WHY = {
    "a-10min": "Avoidance grows when a task feels big and vague. A tiny, timed start lowers the 'activation energy' — once you begin, the brain usually wants to finish what it started.",
    "a-top3": "Your working memory can only hold a few things at once. Three clear priorities stop the day from feeling like an endless pile and give you quick, visible wins.",
    "a-focus": "Attention works in bursts. Short, protected focus blocks with real breaks help you learn more in less time and leave you less drained.",
    "a-shutdown": "Without a clear stop, study keeps running in the background of your mind. A shutdown ritual tells your brain the plan is safe, so you can truly rest.",
    "a-map": "Seeing every deadline on one page turns a blurry worry into a concrete plan. Clashes become problems you can solve early instead of surprises.",
    "b-phone": "Screens in bed keep the brain alert and delay sleep. Putting the phone out of reach removes the easiest reason to stay awake.",
    "b-dump": "Unfinished thoughts keep the mind 'on'. Writing them down before bed parks them safely, which makes it easier to switch off and fall asleep.",
    "b-wake": "Your wake-up time sets your body clock. Keeping it steady — even after a late night — makes falling asleep easier and lifts daytime energy and mood.",
    "b-daylight": "Morning light is the strongest signal to your body clock. It sharpens alertness in the day and helps you feel sleepy at the right time at night.",
    "b-caffeine": "Caffeine stays in the body for many hours. Stopping by early afternoon protects deep sleep, even if you feel you can fall asleep anyway.",
    "b-20min": "Lying awake and frustrated teaches the brain that bed is a place to worry. Getting up briefly and returning when sleepy rebuilds the bed–sleep link.",
    "c-breath": "A long, slow out-breath activates the body's calming system. Calming the body first gives racing thoughts room to settle.",
    "c-checkin": "Naming how stressed you are and one feeling turns a vague heaviness into something you can understand. Labelling emotions is known to lower their intensity.",
    "c-worry": "Worries loop when they stay in your head. Writing one down and sorting it into 'can act / can't act' shrinks it to its real size.",
    "c-joy": "Stress narrows life down to tasks. Small, regular moments of enjoyment refill your energy and remind your mind that rest is allowed.",
    "d-honest": "Carrying stress alone makes it heavier. One honest sentence to a trusted person opens the door to support without needing a big conversation.",
    "d-reset": "Seeing constant updates keeps reopening the hurt. Reducing contact for a while gives your mind space to heal at its own pace.",
    "d-nextto": "Simply being near others while you work eases loneliness and helps focus — connection without pressure to talk.",
    "d-call": "A short, regular call home keeps you connected to people who know you well, which can steady you when campus life feels far from home.",
    "d-join": "Belonging grows through small, repeated contact. One low-pressure activity creates familiar faces — the first step towards friendship.",
    "e-three": "The mind notices what's undone far more than what's done. Writing three things you did each night slowly corrects that picture and rebuilds self-belief.",
    "f-money": "Money worry loops when it stays unspoken. A short, planned conversation brings real information and usually makes the problem smaller.",
    "f-faculty": "Faculty often have more flexibility than students expect. Asking early turns a stuck situation into a plan you can work with.",
    "f-senior": "Seniors have walked the path a year or two ahead of you. A short talk can turn a foggy future into a few clear next steps.",
}


def enrich_plan(plan: list) -> list:
    return [{**a, "why": WHY.get(a["id"], "")} for a in plan]


def next_activities(report: dict, limit: int = 3) -> list:
    taken = {a["id"] for a in report.get("plan", [])}
    out = []
    for area in report.get("priorities", []):
        for a in ACTIVITIES.get(area, []):
            if a["id"] not in taken and a["id"] not in {x["id"] for x in out}:
                out.append({**a, "why": WHY.get(a["id"], "")})
                break
    for area in report.get("priorities", []):
        for a in ACTIVITIES.get(area, []):
            if len(out) < limit and a["id"] not in taken and a["id"] not in {x["id"] for x in out}:
                out.append({**a, "why": WHY.get(a["id"], "")})
    return out[:limit]
