"""MindEdge (Grades 9-10) content: six stress areas, 180-item bank (data/mindedge_bank.json), theory,
activity library, scripts and demo users. Same structure as content.py (EquiMind) so all engines can share code."""
import copy
import json
import os

import content as EQ
import plan_theory as PT

PROGRAMME = "mindedge"
NAME = "MindEdge"
AUDIENCE = "Indian secondary-school students in Grades 9-10 (14-15 years)"
SCALE = EQ.SCALE
BODY_AREA, EMO_AREA = "F", "E"
BREAKUP_SUBTHEME = None
# MindEdge area -> closest EquiMind area, used to reuse the shared exercise / reads / games libraries
WELLNESS_MAP = {"A": "A", "B": "F", "C": "D", "D": "E", "E": "C", "F": "B"}
# EquiMind area -> MindEdge area, used to relabel the shared libraries for MindEdge students
LABEL_MAP = {"A": "A", "B": "F", "C": "E", "D": "C", "E": "D", "F": "B"}

with open(os.path.join(os.path.dirname(__file__), "data", "mindedge_bank.json"), encoding="utf-8") as fh:
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
    "A": "When tests and homework pile up at Grade 10, your brain can't tell where to start - so it keeps starting with nothing. The way out isn't more hours; it's making the first step tiny. A 10-minute start beats hours of worrying, and three visible tasks always beats a vague pile of 'everything'.",
    "B": "When home starts to feel like a report card, every mark seems to carry your parents' mood too. Expectations and comparisons usually come from love and worry, but left unspoken they turn into pressure you carry alone. A short, calm talk that isn't about marks gives everyone something real to work with.",
    "C": "Peer dynamics at your age swing hard — someone you trusted goes quiet, a group reshapes, a joke lands wrong. The pull to fit in is biological; it isn't a weakness in you. What helps most is one safe friend and one trusted adult who takes you seriously when it feels heavy.",
    "D": "At Grade 10 your brain is literally rebuilding itself, and that's why self-criticism and 'everyone is ahead' hit harder than they should. Imposter feelings are a side effect of the age, not evidence about you. Your actual record (what you've done) is more honest than your inner critic.",
    "E": "When stress builds without a release, your body stays switched on — so small things feel big and you snap or shut down. You can't think your way out of a racing body; calming the body first lets the thoughts follow. Naming what you feel, even in one word, takes some of its power away.",
    "F": "Apps are built to keep you scrolling, so losing track of time is not a willpower problem. Comparison feeds and late-night screens push sleep later and make your own life look smaller than it is. Putting the phone out of reach for small, fixed windows is the easiest lever to pull first.",
}

_EQ_ACTS = {a["id"]: a for v in EQ.ACTIVITIES.values() for a in v}
_A = EQ._A


def _r(aid, **over):
    a = copy.deepcopy(_EQ_ACTS[aid])
    a.update(over)
    return a


_NEW = {
    "e-parent": _A("e-parent", "Ten-minute parent check-in (no marks talk)", "Parent check-in", "10 min, twice this week", [
        "Pick a calm moment — a walk, tea, a car ride — not right after a test result.",
        "Agree on one rule for these 10 minutes: no marks, no ranks, no comparisons.",
        "Share one thing from your day that has nothing to do with studies, and ask about theirs."], "When home has started to feel like a scoreboard"),
    "e-needs": _A("e-needs", "Telling a parent what you need", "Say what you need", "5 min, once this week", [
        "Finish this line on paper first: 'What would really help me right now is…'",
        "Say it to one parent: 'I'm not asking you to fix anything — I just need ___.'",
        "Agree one small thing to try this week, and check in on Sunday."], "When you feel unheard or compared at home"),
    "e-note": _A("e-note", "A written note when words are hard", "Written note", "10 min, once", [
        "Write a short note or message to a parent or family member — 4 or 5 lines is enough.",
        "Say what you've been feeling and one thing that would help. No need to be perfect.",
        "Leave it where they'll find it, or send it, and let them come to you."], "When saying it out loud feels too hard"),
    "e-adult": _A("e-adult", "Tell one trusted adult", "Trusted adult", "10 min, once this week", [
        "Pick one adult who takes you seriously — parent, aunt / uncle, class teacher, elder cousin.",
        "Say one honest line: 'Something at school has been bothering me and I'd like to tell you.'",
        "You don't need advice — ask them to just listen first."], "Any time a peer problem feels too big to hold"),
    "e-noscript": _A("e-noscript", "The no-script line", "No-script line", "1 min to prepare", [
        "Decide on one simple sentence: 'Not today, maybe later.' / 'Not my thing.' / 'My parents would notice.'",
        "You don't owe reasons — a short line said calmly works best.",
        "Walk away afterwards. Rehearse it once with a trusted adult if it helps."], "For peer pressure to do something you don't want to"),
    "e-onefriend": _A("e-onefriend", "The one-friend plan", "One friend", "10 min, 3 times a week", [
        "Pick one classmate who feels safe and kind — not the most popular, just the easiest to be with.",
        "Create small repeated moments: sit together at lunch, walk to the bus, share notes.",
        "Keep it light and regular. Belonging grows from small moments, not big ones."], "When you feel left out or alone at school"),
    "e-mute": _A("e-mute", "Mute or block quietly", "Mute / block", "2 min, as needed", [
        "When an account or group keeps hurting you, mute, restrict or block it — no announcement needed.",
        "Screenshot anything threatening or cruel before you leave, and show a trusted adult.",
        "Fill the gap with one feed or friend that leaves you feeling better."], "When online messages or groups keep hurting you"),
    "e-3wins": _A("e-3wins", "The 3-wins log", "3-wins log", "2 min, each night", [
        "Open a note. Write 3 things you did today — small ones count (woke up on time, finished one task).",
        "Re-read the week's entries each Sunday.",
        "When comparison hits, open the log. Proof lives there."], "Just before sleep"),
    "e-fairer": _A("e-fairer", "Fairer-thought exercise", "Fairer thought", "5 min, as needed", [
        "Write the thought down ('I'm the worst in my class').",
        "Underneath, write one piece of evidence FOR it, and one AGAINST it.",
        "Write a fairer version — honest, not fake-positive ('I'm struggling with one subject, not every subject')."], "When a 'I'm not enough' thought shows up"),
    "e-strength": _A("e-strength", "One honest-strength list", "Strength list", "10 min, every Sunday", [
        "Write 3 things you're genuinely okay or good at — skills, habits or ways you treat people.",
        "Next to each, write one real moment from this week that shows it.",
        "Keep the list; add one line every Sunday."], "When you feel you're not good at anything"),
    "e-socialfast": _A("e-socialfast", "Evening social-media fast", "Social fast", "30 min, each evening", [
        "Pick a 30-minute window each evening — ideally the hour before bed.",
        "Log out of the apps that make you compare most, or move them off your home screen.",
        "Use the time for anything offline: music, a walk, a chat, a book."], "When scrolling leaves you feeling behind"),
}

ACTIVITIES = {
    "A": [_r("a-10min", steps=["Pick the subject you've avoided most. Write the first step in one line ('open chapter 6, copy the aim').",
                               "Set a 10-min timer, phone in another room. Do only that step.",
                               "When the timer rings, you may stop. Most days you'll want to continue a bit more."],
             when="For the subject you've been avoiding most"),
          _r("a-top3", steps=["Before any screen, write the 3 things that must be done today.", "Everything else waits for today.",
                              "Tick them off through the day. Keep the list in sight."], when="Any day with more than one deadline on your head"),
          _r("a-focus"), _r("a-shutdown"), _r("a-map")],
    "B": [_NEW["e-parent"], _NEW["e-needs"], _NEW["e-note"]],
    "C": [_NEW["e-adult"], _NEW["e-noscript"], _NEW["e-onefriend"], _NEW["e-mute"]],
    "D": [_NEW["e-3wins"], _NEW["e-fairer"], _NEW["e-strength"]],
    "E": [_r("c-checkin"), _r("c-breath"), _r("c-worry"), _r("c-joy")],
    "F": [_r("b-phone"), _NEW["e-socialfast"], _NEW["e-mute"], _r("b-dump"), _r("b-wake")],
}
_BY_ID = {a["id"]: a for v in ACTIVITIES.values() for a in v}
PLAN_START = "b-wake"
PLAN_CHECKIN = "c-checkin"
PLAN_FILLERS = ["b-phone", "b-dump", "a-10min", "d-honest"]


def act(aid):
    return _BY_ID.get(aid) or _EQ_ACTS[aid]


WHY = {**PT.WHY,
       "e-parent": "A short, regular talk that isn't about marks reminds both of you that home is about more than results.",
       "e-needs": "Naming one specific need turns vague tension into something a parent can actually help with.",
       "e-note": "Writing lets you say the important part calmly, and gives the other person time to respond well.",
       "e-adult": "A trusted adult can see options you can't, and simply being heard makes a peer problem lighter.",
       "e-noscript": "A ready line removes the pressure to think on the spot, so saying no gets easier each time.",
       "e-onefriend": "Small, repeated moments with one safe person build belonging faster than trying to fit into a whole group.",
       "e-mute": "Removing a repeated source of hurt protects your mood without needing a confrontation.",
       "e-3wins": "Writing small wins each night builds a real record your inner critic can't argue with.",
       "e-fairer": "Weighing evidence for and against a harsh thought shows it is an opinion, not a fact.",
       "e-strength": "Naming real strengths with real examples steadies confidence when comparison hits.",
       "e-socialfast": "A daily window away from comparison feeds lowers background pressure and protects the hour before sleep."}

LOOP_FRAGMENTS = {"A": "Pile-up & avoidance", "B": "Pressure at home", "C": "Trying to fit in",
                  "D": "Inner critic", "E": "On edge & overwhelmed", "F": "Late screens & comparison"}
AREA_PHRASES = {
    "A": "tests and homework are piling up and starting is the hardest part",
    "B": "expectations, comparisons or tension at home are weighing on you",
    "C": "fitting in and what your friends think are taking a lot out of you",
    "D": "your inner critic is louder than your real record",
    "E": "your feelings feel big and hard to switch off",
    "F": "screens and social media are eating time and making you feel behind",
}
FATIGUE_ITEMS = {"A3-04", "E1-05", "E3-01", "E3-03", "E3-07"}
BODY_TABLE = EQ.BODY_TABLE
SCRIPTS = [
    {"to": "To a parent", "text": "Can we talk for 15 minutes? Something at school has been bothering me, and I don't need a solution — I just want to tell you."},
    {"to": "To a class teacher", "text": "Ma'am / Sir, I've been finding it hard to concentrate in class lately. Can I speak to you for 5 minutes after school?"},
    {"to": "To one safe classmate", "text": "Can we sit together at lunch this week? I've been feeling a bit alone."},
]
DEMO_USERS = [
    {"id": "me-riya", "role": "student", "programme": "mindedge", "name": "Riya Sharma", "program": "Grade 10 · Section A", "level": "Secondary", "year": "", "institution": "Demo Secondary School", "student_code": "ME-10-3051"},
    {"id": "me-arjun", "role": "student", "programme": "mindedge", "name": "Arjun Mehta", "program": "Grade 9 · Section B", "level": "Secondary", "year": "", "institution": "Demo Secondary School", "student_code": "ME-09-3124"},
    {"id": "me-sana", "role": "student", "programme": "mindedge", "name": "Sana Khan", "program": "Grade 10 · Section C", "level": "Secondary", "year": "", "institution": "Demo Secondary School", "student_code": "ME-10-3188"},
    {"id": "me-rahul", "role": "counsellor", "programme": "mindedge", "name": "Mr. Rahul Iyer", "program": "School Counsellor · Student Wellbeing", "level": "", "year": "", "institution": "Demo Secondary School", "student_code": ""},
]
