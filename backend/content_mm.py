"""MindMellow (Grades 11-12) content: six stress areas, 180-item bank (data/mindmellow_bank.json), theory,
activity library, scripts and demo users. Same structure as content.py (EquiMind) so all engines can share code."""
import copy
import json
import os

import content as EQ
import plan_theory as PT

PROGRAMME = "mindmellow"
NAME = "MindMellow"
AUDIENCE = "Indian senior-secondary students in Grades 11-12 (16-18 years)"
SCALE = EQ.SCALE
BODY_AREA, EMO_AREA = "F", "E"
# MindMellow area -> closest EquiMind area, used to reuse the shared exercise / reads / games libraries
WELLNESS_MAP = {"A": "A", "B": "F", "C": "F", "D": "D", "E": "C", "F": "B"}

with open(os.path.join(os.path.dirname(__file__), "data", "mindmellow_bank.json"), encoding="utf-8") as fh:
    _RAW = json.load(fh)

AREAS, SUBTHEMES, ITEMS = [], {}, {}
for a in _RAW:
    AREAS.append({"key": a["key"], "name": a["name"], "short": a["short"]})
    for s in a["subthemes"]:
        SUBTHEMES[s["key"]] = {"key": s["key"], "area": a["key"], "name": s["name"]}
        for i, t in enumerate(s["items"], 1):
            iid = f"{s['key']}-{i:02d}"
            ITEMS[iid] = {"id": iid, "area": a["key"], "subtheme": s["key"], "text": t, "status": "active"}
AREA_BY_KEY = {a["key"]: a for a in AREAS}

THEORY = {
    "A": "When boards and entrance exams sit together in your head, your brain can't decide which to start — so it does neither. The trick is to pick 2 subjects per day and let the rest wait. Mock scores dip when you're exhausted, not when you're less capable.",
    "B": "'Figuring it out' feels like one giant decision, but it's a series of small ones made over months. Nobody at 17 has the whole picture. The right moves now are narrowing fields of interest and talking to people who are one step ahead — not nailing the final answer.",
    "C": "When home starts to feel like a scoreboard, every result seems to carry your family's happiness too. Expectations usually come from love and worry, but unspoken they turn into pressure. One honest, planned conversation — and remembering you are more than a comparison — gives everyone something real to work with.",
    "D": "Carrying stress alone — especially after a breakup, a loss or a conflict with someone close — makes everything heavier. Grief after a relationship ends is real and takes real time; it is not a weakness. Your first honest conversation does not need a therapist — just one person and one line.",
    "E": "When stress builds without a release, your body stays switched on — so small things feel big and rest doesn't feel restful. You can't think your way out of a racing body; calming the body first lets the thoughts follow. Naming what you feel, even in one word, takes some of its power away.",
    "F": "Late screens and late study push sleep later, and short sleep makes focus, mood and motivation run on low battery. This isn't about discipline — it's about protecting the fuel. A fixed wake-up time and the phone away before bed are the two easiest levers to pull first.",
}

_EQ_ACTS = {a["id"]: a for v in EQ.ACTIVITIES.values() for a in v}
_A = EQ._A


def _r(aid, **over):
    a = copy.deepcopy(_EQ_ACTS[aid])
    a.update(over)
    return a


_NEW = {
    "m-2subject": _A("m-2subject", "The 2-subject rule", "2-subject rule", "5 min, each morning", [
        "Pick exactly 2 subjects for serious study today.",
        "The others get only maintenance (a mock, revision, flashcards).",
        "Alternate across the week so everything gets covered."], "Any day with more than 2 subjects on your head"),
    "m-shortlist": _A("m-shortlist", "Shortlist of 5, not 50", "Shortlist of 5", "20 min, once this week", [
        "Pick 5 colleges / courses you'd actually attend — not aspirational ones.",
        "For each, note one real reason you're drawn to it.",
        "Share the shortlist with one trusted adult (parent, mentor, teacher)."], "When the admissions spreadsheet feels infinite"),
    "m-fairer": _A("m-fairer", "The fairer-thought exercise", "Fairer thought", "3 min, when the inner critic hits", [
        "Write the harsh thought exactly as it sounds ('I'm the only one who isn't sorted').",
        "Ask: what would I say to a friend who said this about themselves?",
        "Write one fairer sentence that is still true — and read it once out loud."], "When comparison at home or online makes you feel smaller"),
    "m-socialfast": _A("m-socialfast", "Evening social-media fast", "Social fast", "30 min, each evening", [
        "Pick a 30-minute window each evening — ideally the hour before bed.",
        "Log out of the apps that make you compare most, or move them off your home screen.",
        "Use the time for anything offline: music, a walk, a chat, a book."], "When scrolling leaves you feeling behind"),
}

ACTIVITIES = {
    "A": [_r("a-10min", steps=["Pick the subject you've been avoiding most. Write the first step in one line.",
                               "Set a 10-min timer, phone in another room.",
                               "When the timer rings, you may stop. Most days you'll continue; if you don't, you still showed up."],
             when="For the subject you've been avoiding most"),
          _NEW["m-2subject"], _r("a-focus"), _r("a-top3"), _r("a-map"), _r("a-shutdown")],
    "B": [_r("f-senior", name="The 15-min elder chat", short="Elder chat", time="15 min, once this week",
             steps=["Pick one person 1-3 years ahead of you (college senior, cousin, mentor).",
                    "Ask: 'What's one thing you wish you knew at my stage?' and 'How did you decide between your top 2 options?'",
                    "Try to have 3 such chats this month. Notice the patterns."], when="When the future feels like a dark cloud"),
          _NEW["m-shortlist"], _r("f-money", name="20-minute money conversation with a parent")],
    "C": [_r("d-call"), _NEW["m-fairer"], _r("d-honest")],
    "D": [_r("d-honest", steps=["Pick one person you trust (friend, cousin, sibling). Not for advice — just to be heard.",
                                "Send one honest line: 'The week is a lot, and something is still with me.'",
                                "You don't owe them a solution. You've just shared the weight."]),
          _r("d-reset", name="Low-contact reset (after a breakup)"), _r("d-nextto"), _r("e-three"), _NEW["m-socialfast"]],
    "E": [_r("c-checkin"), _r("c-breath"), _r("c-worry"), _r("c-joy")],
    "F": [_r("b-wake"), _r("b-phone"), _r("b-dump"), _r("b-daylight"), _r("b-caffeine"), _r("b-20min"), _NEW["m-socialfast"]],
}
_BY_ID = {a["id"]: a for v in ACTIVITIES.values() for a in v}
PLAN_START = "b-wake"
PLAN_CHECKIN = "c-checkin"
PLAN_FILLERS = ["b-dump", "b-phone", "a-10min", "d-honest", "c-breath"]


def act(aid):
    return _BY_ID.get(aid) or _EQ_ACTS[aid]


WHY = {**PT.WHY,
       "m-2subject": "Deciding in advance which two subjects get real effort removes the daily 'where do I start' freeze, while light maintenance keeps the rest from slipping.",
       "m-shortlist": "A short, real list turns an endless worry into a few concrete options you can actually research and discuss.",
       "m-fairer": "Writing a fairer, still-true sentence interrupts the inner critic and makes comparison feel less like a verdict.",
       "m-socialfast": "A daily window away from comparison feeds lowers background pressure and protects the hour before sleep.",
       "f-senior": "People one step ahead show that big decisions are made in small steps — and give you real information instead of looping worry."}

LOOP_FRAGMENTS = {"A": "Exam pile-up & avoidance", "B": "Future & admissions worry", "C": "Pressure at home",
                  "D": "Carrying it alone", "E": "On edge & overwhelmed", "F": "Late nights & broken sleep"}
AREA_PHRASES = {
    "A": "boards and entrance-exam prep are crowding your days",
    "B": "colleges, career and money questions are looping in your head",
    "C": "expectations and tension at home are weighing on you",
    "D": "relationships, comparison or a breakup may be taking more out of you than you show",
    "E": "your emotional load feels heavy and hard to switch off",
    "F": "late nights and screens are cutting into your sleep and energy",
}
FATIGUE_ITEMS = {"A4-03", "E3-01", "E3-03", "F2-04"} | {i for i in ITEMS if i.startswith("F3-0") and i[-1] in "1235"}
BODY_TABLE = EQ.BODY_TABLE
SCRIPTS = [
    {"to": "To a counsellor", "text": "My sleep's been bad, exams are stacking up, and something personal is still with me. I've kept this to myself. I'd like help getting my routine back."},
    {"to": "To a parent (money / future)", "text": "I've been feeling the pressure about colleges and costs, and avoiding the topic. Can we spend 20 minutes going through options and what's actually possible?"},
    {"to": "To a teacher (deadline)", "text": "Two submissions / mocks fall in the same week. Could we agree which to prioritise, or could I get a short extension on one?"},
]
DEMO_USERS = [
    {"id": "mm-aarav", "role": "student", "programme": "mindmellow", "name": "Aarav Shah", "program": "Class 12 · Science", "level": "Senior secondary", "year": "", "institution": "Demo Senior Secondary School", "student_code": "MM-12-1042"},
    {"id": "mm-diya", "role": "student", "programme": "mindmellow", "name": "Diya Nair", "program": "Class 11 · Commerce", "level": "Senior secondary", "year": "", "institution": "Demo Senior Secondary School", "student_code": "MM-11-2210"},
    {"id": "mm-kabir", "role": "student", "programme": "mindmellow", "name": "Kabir Singh", "program": "Class 12 · Humanities", "level": "Senior secondary", "year": "", "institution": "Demo Senior Secondary School", "student_code": "MM-12-1177"},
    {"id": "mm-neha", "role": "counsellor", "programme": "mindmellow", "name": "Ms. Neha Kapoor", "program": "School Counsellor · Student Wellbeing", "level": "", "year": "", "institution": "Demo Senior Secondary School", "student_code": ""},
]
