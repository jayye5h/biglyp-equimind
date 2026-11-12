"""FocusEdge (Grades 6-8, 11-13 years) content: ten focus / study-habit segments (D1-D10), 300-item bank
(data/focusedge_bank.json, 40 items per sitting), theory, activity library, scripts, demo users and its own
age-appropriate wellness library (guided exercises, brain games, reads, nudges). Not a stress report and never
a diagnosis: no clinical labels (ADHD, ADD, LD ...) appear anywhere in student-facing copy."""
import json
import os

import content as EQ

PROGRAMME = "focusedge"
NAME = "FocusEdge"
AUDIENCE = "Indian middle-school students in Grades 6-8 (11-13 years); it measures focus, study habits and learning energy, not stress"
SCALE = EQ.SCALE
BODY_AREA, EMO_AREA = "D8", "D9"
BREAKUP_SUBTHEME = None
INTERLEAVE = True            # 40 items shown round-robin across the ten segments
SAME_WINDOW = (14, 21)       # Day-14 retake serves the SAME 40 items
SAME_KIND = "day14"
SCORE_MEANING = "higher = more consistent, supportive focus and study habits"
LOOP_WORD = "habit loop (how focus slips and feeds back)"
LOOP_END = "Late-night catch-up"
FALLBACK_TAIL = ("None of this is a verdict on you — these are habits and routines, and they can change with small daily steps "
                 "over the next 14 days.")

with open(os.path.join(os.path.dirname(__file__), "data", "focusedge_bank.json"), encoding="utf-8") as fh:
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
    "D1": "Attention isn't about trying harder — it's about setting up your brain and your space so focus can happen. At your age, attention naturally works in short bursts of 15-25 minutes, then drifts. The goal isn't 'focus for 2 hours straight' — it's 'focus well for 20 minutes, rest a bit, then do another 20'. Your phone is the single biggest reason attention breaks for students your age.",
    "D2": "Starting a task is the hardest part — for every student. It's not laziness, it's a real brain thing. What helps isn't willpower; it's making the first step so tiny your brain can't say no. A 2-minute start beats 2 hours of worrying about starting.",
    "D3": "At your age, your brain is still learning to say 'not now' to distractions — especially from screens. That's normal, not weak. The trick isn't 'be stronger' — it's to make the distraction harder to reach and the task easier to pick up.",
    "D4": "Your brain can only hold a few things at once, so a plan that lives only in your head keeps slipping. Writing it down — what, when, where — does the remembering for you. Time also feels shorter than it is at your age, so a clock and a short list are your best friends.",
    "D5": "Everyone gets stuck — even the students who look like they always know. Asking a question is not a sign of being 'slow'; it's how learning actually works. Your brain grows most when you try, get it a bit wrong, and try again with a little help.",
    "D6": "Boredom is a signal, not a character flaw. Your brain is built to chase things that feel interesting or useful. When school feels pointless, linking a lesson to something you care about — a game, a hobby, a goal — switches curiosity back on.",
    "D7": "Mistakes feel bad because your brain cares about doing well — that's a good sign. But giving up after one wrong answer means you miss the part where learning happens. 'Not yet' is more honest than 'I can't', and one more try is often all it takes.",
    "D8": "Your brain runs on sleep, food, water, daylight and rest. At 11-13 you need about 9-11 hours of sleep, and screens late at night push sleep later. When energy is low, focus is low — fixing the body basics is often the fastest way to fix attention.",
    "D9": "Your feelings and your focus are connected. When you feel nervous, angry or overwhelmed, the 'thinking' part of the brain goes quiet and the 'alarm' part gets loud. Calming your body first — a few slow breaths — lets the thinking part switch back on.",
    "D10": "Where and with whom you study matters as much as how hard you try. A quiet, tidy spot, an adult who helps you set up, and a friend who studies at the same time make focus much easier — and asking for that support is a smart move, not a weak one.",
}

_A = EQ._A
_NEW = [
    # D1 Focus & attention
    _A("fe-pomo", "Pomo-25 (25-minute focus burst)", "25-min burst", "25 min + 5 min rest", [
        "Pick one subject or task. Set a 25-minute timer.",
        "Phone in another room (not pocket, not desk). One thing in front of you — just the task.",
        "When the timer rings, take 5 minutes to stand, drink water, look out the window. Then another 25-minute burst."], "Any study session, any day"),
    _A("fe-triangle", "Study triangle (set up your space)", "Study triangle", "5 min, once to set up", [
        "Choose one focus spot at home — the same place every day.",
        "Only 3 things on the desk: your book, pen, water bottle. Nothing else.",
        "Face a wall or a quiet corner. Your brain uses less energy when there's less to look at."], "Before every study session"),
    _A("fe-3breath", "Three-breath pause", "3-breath pause", "15 seconds", [
        "When you feel the urge to switch tasks, pause.",
        "Take 3 slow breaths — in for 4, out for 6.",
        "Ask yourself: 'What was I working on?' Return to that one thing. The urge usually passes in a minute."], "When you feel the urge to switch to phone / game / something else"),
    _A("fe-reanchor", "'Where was I?' re-anchor", "Re-anchor", "30 seconds, as needed", [
        "When you notice your mind has wandered, don't scold yourself — just notice.",
        "Put your finger on the last line you read or the last step you did.",
        "Say quietly: 'I was here. Next is ___.' and do just that next step."], "When you lose your place while reading or working"),
    # D2 Getting started
    _A("fe-2min", "The 2-minute rule", "2-min start", "2 min", [
        "Pick the task you've been avoiding most.",
        "Tell yourself: 'Just 2 minutes. Even if I stop after, that counts.'",
        "Start the first step — open the book, write the date, copy the first line. Most days, you'll want to keep going."], "For any task you're avoiding"),
    _A("fe-firststep", "First-step list", "First step", "5 min, every evening before study", [
        "For each homework, write ONLY the first physical action ('open notebook, write Q1' — not 'do maths').",
        "Keep the list on your table where you can see it.",
        "When you sit down, read the first item and do that one thing. The rest follows."], "When your mind goes blank on 'where to begin'"),
    _A("fe-launch", "Launch ritual", "Launch ritual", "1 min, every study session", [
        "Choose the same 3 small actions to start every study time — e.g. fill water, open planner, sharpen pencil.",
        "Do them in the same order, every time you sit down.",
        "After the third action, start the first question. Your brain learns 'this means study time'."], "When switching on your study brain feels slow"),
    _A("fe-timer", "Timer-only promise", "Timer promise", "10 min, once a day", [
        "Set a timer for 10 minutes. Your only promise: work until it rings.",
        "You don't have to finish anything — just keep going till the sound.",
        "When it rings, choose: stop, or set one more timer."], "When a task feels too big to start"),
    # D3 Distraction & delay
    _A("fe-phone", "Phone in another room", "Phone away", "30 sec at the start of study", [
        "Before you sit to study, put your phone in a different room.",
        "Not face-down on the desk — out of sight AND out of arm's reach.",
        "If you need to look at something, get up, go get it, come back. The small walk makes it less automatic."], "Every study session"),
    _A("fe-notif", "Notifications off by default", "Notifications off", "2 min to set up, once", [
        "With a parent, turn off notifications for games, videos and chat apps.",
        "Keep only calls and messages from family on.",
        "Check apps on purpose after study — not when they buzz."], "When buzzes and pop-ups keep breaking your focus"),
    _A("fe-notnow", "'Not now, after the timer' self-talk", "Not now", "5 seconds, as needed", [
        "When a thought like 'let me just check…' pops up, notice it.",
        "Say quietly: 'Not now — after the timer.' Write it on a sticky note if it's important.",
        "Go back to your task. The note keeps the idea safe for later."], "When your own thoughts pull you away"),
    _A("fe-cleandesk", "Clean desk before starting", "Clean desk", "3 min, before study", [
        "Before you start, clear the desk of everything except today's task.",
        "Put toys, snacks, extra books and gadgets in a box or drawer.",
        "Start the task the moment the desk is clear."], "When things on the table keep pulling you away"),
    # D4 Planning & organisation
    _A("fe-deadline", "One-page deadline map", "Deadline map", "15 min, once a week", [
        "On one page, write every test, project and homework due in the next 2 weeks.",
        "Put a coloured dot next to the closest ones.",
        "Stick it near your study spot and look at it every Sunday."], "When dates keep surprising you"),
    _A("fe-pack", "Pack-the-bag tonight", "Pack the bag", "5 min, every night", [
        "Look at tomorrow's timetable.",
        "Pack books, notebooks, pencil box and anything special (PE kit, project) tonight — not in the morning.",
        "Keep the bag by the door. Mornings get calmer."], "When you often forget things for school"),
    _A("fe-colour3", "Colour-code today's top 3", "Top-3 colours", "3 min, after school", [
        "Write today's 3 most important tasks.",
        "Colour them: red = must do today, yellow = should do, green = nice to do.",
        "Start with red. Tick each when done."], "When there's too much and you don't know what comes first"),
    _A("fe-microplan", "'When → where → what' micro-plan", "Micro-plan", "2 min per task", [
        "For each task, write: WHEN (time), WHERE (place), WHAT (first step).",
        "Example: '5:30 pm · study table · open science page 42.'",
        "When the time comes, the plan has already decided for you."], "For homework that keeps slipping to 'later'"),
    # D5 Learning confidence
    _A("fe-handup", "Hand-up practice", "Hand up", "1 question per class", [
        "Pick one class today where you'll ask or answer one question.",
        "Prepare it — write the question in your notebook first.",
        "Raise your hand once. It gets easier every time."], "When you're scared to speak in class"),
    _A("fe-honestline", "One honest line to the teacher", "Honest line", "1 min, once this week", [
        "Choose a kind teacher and a calm moment — after class is fine.",
        "Say one line: 'I didn't follow that part. Could you explain it again?'",
        "Write down what they say so you remember it."], "When you pretend to understand but don't"),
    _A("fe-mistakelog", "Mistake log", "Mistake log", "5 min, after each test or homework", [
        "In one notebook page, write each mistake: what went wrong.",
        "Next to it, write one line to fix it next time.",
        "Read the log before the next test. Mistakes become your study guide."], "After a test, a correction or a wrong answer"),
    _A("fe-helpscript", "Help-seeking script with a parent", "Ask a parent", "5 min, once this week", [
        "Pick a calm time — not when anyone is rushed.",
        "Say: 'I'm finding ___ hard. Can you help me figure out what to do?'",
        "Agree on one small thing to try together this week."], "When you're stuck and haven't told anyone"),
    # D6 Learning motivation & meaning
    _A("fe-curious", "One curious question a day", "Curious question", "3 min, once a day", [
        "After school, write one 'I wonder…' question about something you learned.",
        "Look it up, ask an adult, or bring it to class tomorrow.",
        "Keep a page of your questions — it becomes your own wonder list."], "When lessons feel boring"),
    _A("fe-whylink", "Why-it-matters link", "Why link", "2 min, before homework", [
        "Before you start, ask: 'Where could I use this in real life?'",
        "Link it to something you like — cricket scores, cooking, games, building things.",
        "Write the link at the top of your page."], "When school feels pointless"),
    _A("fe-proud", "Proud-of-me note", "Proud note", "1 min, each evening", [
        "Each evening, write one line: 'Today I'm proud that I…'",
        "It can be small — finished one sum, asked one question, tried something hard.",
        "Read the week's notes on Sunday."], "When you only feel good if someone praises you"),
    # D7 Persistence & recovery after mistakes
    _A("fe-onemore", "'Try one more, then I can stop' rule", "One more try", "2-5 min, after a mistake", [
        "When you get something wrong and want to quit, pause.",
        "Promise yourself just one more try — a different way, or with a hint.",
        "After that one try, you're allowed to stop. Often, you won't want to."], "Right after a mistake or a wrong answer"),
    _A("fe-yet", "The power of 'yet'", "Not yet", "10 seconds, as needed", [
        "Catch the thought 'I can't do this'.",
        "Add one word: 'I can't do this YET.'",
        "Then ask: 'What's one small thing that would help?' Do that."], "When you want to give up early"),
    _A("fe-kindcoach", "Kind-coach voice", "Kind coach", "1 min, as needed", [
        "When you call yourself 'stupid', stop and ask: 'What would I say to a friend?'",
        "Say that kinder line to yourself — out loud or in your head.",
        "Write it in your notebook so it's there next time."], "When you're hard on yourself after a bad result"),
    # D8 Energy & rest
    _A("fe-wake", "Fixed bedtime and wake time", "Wake same time", "0 min, every day", [
        "Choose a bedtime and wake time with a parent — keep them within 30 minutes every day, even weekends.",
        "Set one alarm for waking. Get out of bed when it rings.",
        "Open the curtains or step outside for a few minutes after waking."], "Every day — this is the anchor of the plan"),
    _A("fe-phonebed", "Phone across the room before sleep", "Phone away at night", "30 min before sleep", [
        "30 minutes before bed, put your phone or tablet to charge outside your room or across the room.",
        "No videos in bed.",
        "Read, talk, or listen to calm music instead."], "Every night"),
    _A("fe-breakfast", "Breakfast before leaving home", "Breakfast", "10 min, every school day", [
        "Eat something before school — even fruit, milk, poha or a paratha counts.",
        "Keep a water bottle in your bag and drink through the day.",
        "Notice how class feels on breakfast days."], "Every school morning"),
    _A("fe-sunlight", "15 minutes of outside time", "Outside time", "15 min, once a day", [
        "Spend 15 minutes outside every day — walk, play, cycle, or sit in the sun.",
        "Leave screens inside.",
        "Daylight and movement wake your brain up for homework."], "After school, before homework"),
    _A("fe-screenfree", "Screen-free hour before bed", "Screen-free hour", "1 hour, each evening", [
        "Choose one hour before bed with no screens at all.",
        "Fill it with a book, drawing, a board game or a chat with family.",
        "Tick the day when you manage it."], "When screens eat into sleep"),
    # D9 Emotional readiness
    _A("fe-checkin", "60-second check-in before homework", "60-sec check-in", "1 min, before homework", [
        "Before you open your books, stop for 60 seconds.",
        "Ask: 'How do I feel right now?' Give it one word — calm, tired, worried, cross.",
        "If the word is heavy, take 3 slow breaths or tell an adult before you start."], "Before every homework session"),
    _A("fe-478", "4-7-8 breathing when frustrated", "4-7-8 breath", "1 min, as needed", [
        "Breathe in through your nose for 4 counts.",
        "Hold gently for 7 counts.",
        "Breathe out slowly through your mouth for 8. Do this 3 times, then go back to the task."], "When frustration or anger shows up during work"),
    _A("fe-softstart", "Soft start — begin with the easiest piece", "Soft start", "5 min, each session", [
        "Look at your homework and find the easiest question.",
        "Do that one first to warm up.",
        "Then move to the harder ones while you feel 'switched on'."], "When you feel nervous before studying"),
    # D10 Environment & support
    _A("fe-buddy", "Study buddy", "Study buddy", "30 min, 3 times a week", [
        "Ask one friend to do homework at the same time — in person or on a quiet call with cameras off.",
        "Agree: 25 minutes work, then 5 minutes chat.",
        "Tell each other one thing you finished."], "When studying alone feels lonely or slow"),
    _A("fe-setup", "'Help me set up' request to a parent", "Set-up help", "10 min, once", [
        "Ask a parent: 'Can you help me set up a quiet study spot and time?'",
        "Together pick the place, the time, and where the phone goes.",
        "Try it for a week, then talk about what to change."], "When home is noisy or busy"),
    _A("fe-teachernote", "Teacher note request", "Teacher note", "1 min, once this week", [
        "Ask your teacher politely: 'Could you write the instructions on the board or in my diary?'",
        "Copy them into your planner.",
        "Tick them off as you finish."], "When you forget instructions after class"),
    # plan filler
    _A("fe-askhelp", "Ask for help with one thing", "Ask for help", "2 min, once a day", [
        "Pick one thing you're stuck on today — a sum, a word, a plan.",
        "Ask one person: a parent, a teacher, an elder sibling or a friend.",
        "Say thank you, and tick it. Asking is a skill, and you're practising it."], "Any day in Week 2 — or sooner"),
]
_BY_ID = {a["id"]: a for a in _NEW}
_L = lambda *ids: [_BY_ID[i] for i in ids]
ACTIVITIES = {
    "D1": _L("fe-pomo", "fe-triangle", "fe-3breath", "fe-reanchor"),
    "D2": _L("fe-2min", "fe-firststep", "fe-launch", "fe-timer"),
    "D3": _L("fe-phone", "fe-3breath", "fe-notif", "fe-notnow", "fe-cleandesk"),
    "D4": _L("fe-colour3", "fe-deadline", "fe-pack", "fe-microplan"),
    "D5": _L("fe-handup", "fe-honestline", "fe-mistakelog", "fe-helpscript"),
    "D6": _L("fe-whylink", "fe-curious", "fe-proud"),
    "D7": _L("fe-onemore", "fe-yet", "fe-mistakelog", "fe-kindcoach"),
    "D8": _L("fe-phonebed", "fe-breakfast", "fe-sunlight", "fe-screenfree", "fe-wake"),
    "D9": _L("fe-checkin", "fe-478", "fe-softstart", "fe-onemore"),
    "D10": _L("fe-buddy", "fe-setup", "fe-teachernote"),
}
PLAN_START = "fe-wake"
PLAN_CHECKIN = None
PLAN_FILLERS = ["fe-phone", "fe-2min", "fe-pomo", "fe-askhelp", "fe-checkin"]


def act(aid):
    return _BY_ID[aid]


WHY = {
    "fe-pomo": "Attention at your age works in short bursts. A 25-minute block with a real break gets more done than an hour of half-focus, and leaves you less tired.",
    "fe-triangle": "Less to look at means less for your brain to ignore. The same spot every day also tells your brain 'this is where focus happens'.",
    "fe-3breath": "An urge feels strongest in the first minute. Three slow breaths give it time to fade so you can choose instead of react.",
    "fe-reanchor": "Minds wander — that's normal. Coming back quickly and kindly, without scolding, is the real focus skill.",
    "fe-2min": "Starting is the hardest part. A tiny 2-minute start tricks your brain past the 'I don't want to' wall — once you begin, it usually wants to keep going.",
    "fe-firststep": "'Do maths' is too big for the brain to start. A tiny, physical first action is easy to begin, and the rest follows.",
    "fe-launch": "Doing the same small actions each time trains your brain to switch into study mode faster.",
    "fe-timer": "A timer turns 'finish everything' into 'just keep going till it rings', which feels much easier to start.",
    "fe-phone": "Out of sight is out of mind. A phone in another room removes the biggest pull away from your work.",
    "fe-notif": "Every buzz breaks focus, and it takes minutes to get it back. Fewer buzzes means longer, calmer focus.",
    "fe-notnow": "Parking a thought on paper keeps it safe, so your brain can let go and return to the task.",
    "fe-cleandesk": "Things on the desk are little invitations to stop. A clear desk means fewer urges to switch.",
    "fe-deadline": "Seeing every date on one page turns surprises into plans, and stops last-minute panic.",
    "fe-pack": "Packing at night means calmer mornings and fewer forgotten books — one less worry at school.",
    "fe-colour3": "Three clear priorities stop the day from feeling like an endless pile, and give quick wins.",
    "fe-microplan": "Deciding when, where and what in advance means you don't have to decide later — when it's harder.",
    "fe-handup": "Each small question builds courage. Teachers notice and help students who ask.",
    "fe-honestline": "One honest line gets you the help you need, and teachers are usually glad you asked.",
    "fe-mistakelog": "Writing mistakes down turns them into a study guide, so you stop repeating them.",
    "fe-helpscript": "Parents can help much more when they know what's hard. A ready line makes it easier to start.",
    "fe-curious": "Questions switch curiosity back on — and a curious brain learns faster and remembers more.",
    "fe-whylink": "When a lesson connects to something you care about, your brain finds it worth paying attention to.",
    "fe-proud": "Feeling proud of your own effort builds motivation from inside, not only from praise.",
    "fe-onemore": "Most learning happens just after a mistake. One more try keeps you in that learning zone.",
    "fe-yet": "'Yet' reminds your brain that skills grow with practice — it turns a wall into a step.",
    "fe-kindcoach": "A kind inner voice helps you try again; a harsh one makes you want to give up.",
    "fe-wake": "A steady bedtime and wake time set your body clock. Good sleep is the single biggest boost to attention at your age.",
    "fe-phonebed": "Screens in bed keep the brain alert and push sleep later. Moving the phone away protects your sleep.",
    "fe-breakfast": "Your brain needs fuel in the morning. Breakfast and water make focus in class much easier.",
    "fe-sunlight": "Daylight and movement wake the brain up and help you sleep better at night.",
    "fe-screenfree": "An hour without screens before bed helps you fall asleep faster and wake up fresher.",
    "fe-checkin": "Naming how you feel takes a little power away from big feelings, so studying gets easier.",
    "fe-478": "A long, slow out-breath calms the body's alarm, so the thinking part of your brain can switch back on.",
    "fe-softstart": "An easy first win warms up your brain and builds confidence for the harder parts.",
    "fe-buddy": "Working next to someone else who is working makes it easier to start and keep going.",
    "fe-setup": "A quiet spot and a set time make focus easier — and parents are often happy to help set it up.",
    "fe-teachernote": "Written instructions do the remembering for you, so nothing slips away after class.",
    "fe-askhelp": "Asking for help is a skill. Practising it once a day makes it feel normal, not scary.",
}

LOOP_FRAGMENTS = {"D1": "Attention drifts", "D2": "Hard to start", "D3": "Phone / urge hits", "D4": "Plans slip",
                  "D5": "Afraid to ask", "D6": "Feels pointless", "D7": "Gives up early", "D8": "Low sleep & energy",
                  "D9": "Big feelings", "D10": "No quiet space"}
AREA_PHRASES = {
    "D1": "your attention keeps drifting during lessons and reading",
    "D2": "getting started on homework is the biggest hurdle",
    "D3": "your phone and other distractions keep pulling you away",
    "D4": "plans, dates and materials are hard to keep track of",
    "D5": "asking for help and trusting your own ability feel hard",
    "D6": "school feels boring or not very useful right now",
    "D7": "mistakes hit hard and make you want to stop trying",
    "D8": "sleep, food and screen time are draining your energy",
    "D9": "feelings like worry or frustration get in the way of studying",
    "D10": "your study space or support around you isn't helping enough",
}
FATIGUE_ITEMS = {f"D1.4-{i:02d}" for i in range(1, 8)} | {"D8.1-03", "D8.1-07", "D8.2-01", "D8.2-03", "D8.2-08"}


def body_trigger(by, path, fatigue_high):
    return by["D1"]["score"] < 50 or by["D8"]["score"] < 50 or fatigue_high >= 3 or path == 2


def body_pattern(result):
    by = {a["key"]: a for a in result["areas"]}
    bits = [f"Attention {by['D1']['score']}", f"Energy & Rest {by['D8']['score']}"]
    if result["fatigue_high"] >= 1:
        bits.append("often tired, sleepy or foggy")
    return ", ".join(bits)


BODY_TABLE = [
    {"cause": "Sleep & screens", "signs": "Short sleep at your age means short attention. Late screens push sleep later.", "check": "Phone out of the bedroom; aim for 9-11 hours"},
    {"cause": "Eye check", "signs": "Headaches, squinting at the board, missing things in class — glasses may be overdue.", "check": "A 10-minute check with an optician"},
    {"cause": "Vitamin D", "signs": "Low energy, fog, poor sleep — very common in kids who stay indoors or on screens a lot.", "check": "Vitamin D (25-OH) blood test"},
    {"cause": "Vitamin B12", "signs": "Tiredness, trouble concentrating. Common on vegetarian diets.", "check": "Vitamin B12 blood test"},
    {"cause": "Iron (anaemia)", "signs": "Tiredness, poor focus, weakness in PE. Picky eaters are more likely to be low.", "check": "CBC and ferritin / iron"},
    {"cause": "Thyroid (TSH)", "signs": "Energy and mood swings.", "check": "A single blood test rules it in or out"},
    {"cause": "Meals & water", "signs": "Skipping breakfast and not drinking water directly hurt attention.", "check": "Fix this first — it's the easiest"},
]
SCRIPTS = [
    {"to": "To a parent", "text": "I'm finding it hard to focus. Can you help me set up a quieter study time, and keep my phone during study?"},
    {"to": "To a class teacher", "text": "Ma'am / Sir, I'm struggling to follow along during long lessons. Could you repeat the instructions, or help me write them down?"},
    {"to": "To a classmate", "text": "Can we do our homework at the same time this week? It helps me focus when someone else is working too."},
]
DEMO_USERS = [
    {"id": "fe-aarav", "role": "student", "programme": "focusedge", "name": "Aarav Sharma", "program": "Grade 7 · Section B", "level": "Middle school", "year": "", "institution": "Demo Middle School", "student_code": "FE-07-4021"},
    {"id": "fe-meher", "role": "student", "programme": "focusedge", "name": "Meher Kaur", "program": "Grade 6 · Section A", "level": "Middle school", "year": "", "institution": "Demo Middle School", "student_code": "FE-06-4107"},
    {"id": "fe-vihaan", "role": "student", "programme": "focusedge", "name": "Vihaan Reddy", "program": "Grade 8 · Section C", "level": "Middle school", "year": "", "institution": "Demo Middle School", "student_code": "FE-08-4163"},
]

# ---------------------------------------------------------------- own wellness library (ages 11-13, focus-themed)
_B = lambda inhale, hold, exhale, hold2, cycles: {"inhale": inhale, "hold": hold, "exhale": exhale, "hold2": hold2, "cycles": cycles}
_S = lambda *pairs: [{"text": t, "secs": s} for t, s in pairs]

EXERCISES = [
    {"id": "fe_balloon", "name": "Balloon Belly Breath", "kind": "breath", "minutes": 2, "areas": ["D9", "D8", "D1"], "calming": True,
     "intro": "Imagine a balloon in your tummy. Breathe in to fill it, breathe out slowly to let it go soft.",
     "pattern": _B(4, 1, 6, 0, 5), "finish": "Nice and slow. Your body is calmer, and your brain is ready to focus."},
    {"id": "fe_3breath", "name": "Three-Breath Pause", "kind": "breath", "minutes": 1, "areas": ["D3", "D1", "D9"], "calming": True,
     "intro": "The quick reset for when you feel the urge to switch to your phone or a game. In for 4, out for 6.",
     "pattern": _B(4, 0, 6, 0, 3), "finish": "Urge gone or smaller? Now — what were you working on? Go back to just that."},
    {"id": "fe_starbreath", "name": "Star Breathing", "kind": "breath", "minutes": 2, "areas": ["D9", "D7", "D1"], "calming": True,
     "intro": "Trace the five points of a star in your mind — breathe in going up, breathe out coming down.",
     "pattern": _B(3, 1, 4, 1, 5), "finish": "Five points, five calm breaths. You can use your star any time, even in class."},
    {"id": "fe_478", "name": "4-7-8 Cool-Down", "kind": "breath", "minutes": 2, "areas": ["D9", "D7", "D8"], "calming": True,
     "intro": "For when you feel frustrated or angry with homework. A long breath out cools the 'alarm' in your brain.",
     "pattern": _B(4, 7, 8, 0, 3), "finish": "Cooler now. Try just one more question — then you can decide."},
    {"id": "fe_2min", "name": "The 2-Minute Launch", "kind": "steps", "minutes": 3, "areas": ["D2", "D4", "D3"], "calming": False,
     "intro": "Starting is the hardest part. Let's make it so tiny your brain can't say no.",
     "steps": _S(("Think of one task you've been putting off.", 15), ("Find the very first physical action — open the book, write the date.", 25),
                 ("Phone in another room. Only that task in front of you.", 20), ("Now do just that first step. Only two minutes!", 120)),
     "finish": "You started! That was the hardest bit. Keep going if you want — or stop, it still counts."},
    {"id": "fe_spotlight", "name": "Focus Spotlight", "kind": "steps", "minutes": 2, "areas": ["D1", "D3"], "calming": True,
     "intro": "Your attention is like a torch. Let's practise pointing it at one thing at a time.",
     "steps": _S(("Pick one object near you. Look only at it — its colour, its edges.", 25), ("Now close your eyes and listen for the farthest sound.", 25),
                 ("Now the nearest sound.", 20), ("Open your eyes and point your spotlight at your book or task.", 20)),
     "finish": "That's focus — choosing where your torch shines. You just trained it."},
    {"id": "fe_shake", "name": "Shake-It-Out Reset", "kind": "steps", "minutes": 2, "areas": ["D8", "D1", "D2"], "calming": False,
     "intro": "Feeling sleepy or fidgety? Wake your body up so your brain can follow.",
     "steps": _S(("Stand up. Shake your hands for 10 counts.", 15), ("Shake one leg, then the other.", 15), ("Reach up high, then touch your toes — 5 times.", 25),
                 ("Drink some water and sit back down tall.", 20)),
     "finish": "Body awake, brain awake. Great time to start your next 25-minute burst."},
    {"id": "fe_desk", "name": "Desk Reset", "kind": "steps", "minutes": 3, "areas": ["D4", "D10", "D3"], "calming": False,
     "intro": "A tidy desk means fewer things pulling at your attention. Let's set it up together.",
     "steps": _S(("Take everything off the desk that isn't for today's task.", 45), ("Keep only 3 things: your book, a pen, a water bottle.", 30),
                 ("Put your phone in another room.", 20), ("Write today's first step on a sticky note and put it in front of you.", 30)),
     "finish": "Your study triangle is ready. Your brain will thank you."},
    {"id": "fe_yet", "name": "The Power of 'Yet'", "kind": "steps", "minutes": 2, "areas": ["D7", "D5", "D6"], "calming": True,
     "intro": "When something feels too hard, one little word can change how it feels.",
     "steps": _S(("Think of something you feel you 'can't' do.", 20), ("Say it with a new ending: 'I can't do this… YET.'", 20),
                 ("Think of one thing that would help — a hint, an example, a person.", 25), ("Picture yourself doing it a week from now.", 20)),
     "finish": "Skills grow with practice — that's how every brain works. 'Yet' is on your side."},
    {"id": "fe_proud", "name": "Proud-of-Me Moment", "kind": "steps", "minutes": 2, "areas": ["D6", "D5", "D7"], "calming": False,
     "intro": "You don't need someone else to say 'well done'. Let's notice your own effort.",
     "steps": _S(("Think of one thing you tried today, even if it was hard.", 25), ("Think of one moment you didn't give up.", 25),
                 ("Think of one thing you learned or noticed.", 25), ("Say quietly: 'I'm proud that I…' and finish the sentence.", 20)),
     "finish": "That proud feeling came from you. Keep it — it's fuel for tomorrow."},
    {"id": "fe_grounding", "name": "5-4-3-2-1 Calm Senses", "kind": "steps", "minutes": 3, "areas": ["D9", "D3", "D1"], "calming": True,
     "intro": "When your mind feels full or jumpy, bring it back to the room one sense at a time.",
     "steps": _S(("Name 5 things you can see.", 30), ("Notice 4 things you can feel — your feet, the chair.", 30), ("Listen for 3 sounds.", 25),
                 ("Find 2 things you can smell.", 20), ("Name 1 thing you like about today.", 20)),
     "finish": "You're here, and you're okay. Your brain is calmer and ready."},
    {"id": "fe_buddy", "name": "Ask-for-Help Practice", "kind": "steps", "minutes": 2, "areas": ["D5", "D10"], "calming": False,
     "intro": "Asking for help is a skill — and like any skill, it gets easier with practice.",
     "steps": _S(("Think of one thing you're stuck on.", 20), ("Pick one person you could ask — a parent, teacher, sibling or friend.", 20),
                 ("Practise the words: 'I didn't understand ___. Can you help me?'", 30), ("Decide when you'll ask — today or tomorrow.", 15)),
     "finish": "You're ready. Asking is brave, and smart learners do it all the time."},
]

GAMES = [
    {"id": "memory", "name": "Memory Match", "areas": ["D1", "D9", "D4"], "skill": "Attention & memory",
     "why": "Flip and remember — a fun workout for the same memory you use to hold instructions in class."},
    {"id": "simon", "name": "Echo Pattern", "areas": ["D1", "D4", "D2"], "skill": "Working memory",
     "why": "Watch, remember, repeat. Each round trains your brain to hold a few steps in mind — just like following a teacher's instructions."},
    {"id": "odd-colour", "name": "Odd Colour Out", "areas": ["D3", "D1"], "skill": "Spotting details",
     "why": "Find the one tile that's different. It trains your eyes to focus on one thing and ignore the rest."},
    {"id": "sudoku", "name": "Mini Sudoku", "areas": ["D4", "D7", "D2"], "skill": "Calm logic",
     "why": "One square at a time, no rush. Patient steps solve big puzzles — and big homework too."},
    {"id": "pattern-recall", "name": "Pattern Recall", "areas": ["D1", "D5"], "skill": "Visual memory",
     "why": "Remember which squares lit up. A short game that brings your whole attention to right now."},
    {"id": "slide-puzzle", "name": "Slide Puzzle", "areas": ["D7", "D4", "D6"], "skill": "Never-give-up thinking",
     "why": "Small moves, lots of tries, then — solved! A reminder that sticking with it pays off."},
    {"id": "count-shapes", "name": "Count the Shapes", "areas": ["D1", "D3", "D8"], "skill": "Careful counting",
     "why": "Count slowly and carefully. A calm game that settles a busy mind."},
    {"id": "quick-sums", "name": "Quick Sums", "areas": ["D2", "D6"], "skill": "Brain warm-up",
     "why": "Thirty seconds of easy sums switches your brain into study mode before homework."},
    {"id": "breath-balloon", "name": "Breath Balloon", "areas": ["D9", "D8"], "skill": "Slow breathing",
     "why": "Fill the balloon slowly, let it out slowly. Five breaths and the busy feeling gets smaller."},
]

_R = lambda id, area, tone, title, minutes, summary, body, tip: {
    "id": id, "area": area, "tone": tone, "title": title, "minutes": minutes, "summary": summary, "body": body, "try": tip}
ARTICLES = [
    _R("fe1a", "D1", "calm", "Why Your Mind Wanders (and Why That's Okay)", 2, "Every brain drifts. Here's how to bring yours back kindly.",
       ["Have you ever read a whole page and then realised you don't remember a word? That happens to everyone — adults too.",
        "Your brain is built to notice new things, so it keeps checking for something more interesting. At your age, attention works best in short bursts of about 15-25 minutes.",
        "The trick isn't to never drift. It's to notice and come back quickly — without telling yourself off. Put your finger on the last line, take one breath, and carry on.",
        "Every time you come back, your focus muscle gets a little stronger."], "Next time you drift, say 'I was here' and point to the line."),
    _R("fe1b", "D1", "grow", "Your Focus Has a Battery", 3, "Short focus bursts with real breaks beat long, tired study.",
       ["Think of your attention like a phone battery. It drains as you use it, and it needs recharging.",
        "Try one 25-minute burst: phone in another room, one task only. When the timer rings, stand up, drink water, look out of the window for 5 minutes.",
        "Breaks that are just more screens don't recharge you — they drain you more. Move your body instead.",
        "Two good bursts often get more done than two hours of half-focus."], "Do one 25-minute burst today, with a screen-free 5-minute break."),
    _R("fe2a", "D2", "lift", "Starting Is the Hardest Part — For Everyone", 2, "It's not laziness. It's a real brain thing — and there's a trick.",
       ["If you sit and stare at your book before starting, you're not lazy. Your brain sees a big, foggy task and wants to avoid it.",
        "The trick is to shrink the first step until it's almost silly: open the book. Write the date. Copy question one.",
        "Tell yourself: 'Just 2 minutes, then I can stop.' Most of the time, once you've started, you'll want to keep going.",
        "Starting small isn't cheating. It's how clever people get big things done."], "Pick one task and do a 2-minute start right now."),
    _R("fe2b", "D2", "grow", "Build a Launch Ritual", 2, "Three small actions that tell your brain 'study time'.",
       ["Football players do the same warm-up before every match. It tells their body: game time.",
        "You can do the same for study. Choose three tiny actions — fill your water bottle, open your planner, sharpen your pencil.",
        "Do them in the same order every time you sit down. After a week, your brain will switch on faster.",
        "The best part? You don't need motivation. The ritual does the starting for you."], "Choose your three launch actions and write them down."),
    _R("fe3a", "D3", "calm", "Why Your Phone Pulls So Hard", 3, "Apps are designed to grab you. Here's how to win.",
       ["Games, videos and chat apps are built by clever teams to keep you watching. Feeling pulled by your phone is not a weakness — it's what they're designed to do.",
        "Willpower alone doesn't beat that. Distance does. When your phone is in another room, the pull gets much smaller.",
        "Ask a parent to help: phone goes to the kitchen during homework, and comes back when the timer rings.",
        "You're not giving up your phone — you're choosing when to use it."], "Put your phone in another room for your next homework session."),
    _R("fe3b", "D3", "lift", "'Not Now, After the Timer'", 2, "A tiny sentence that helps you ignore distractions.",
       ["Sometimes the distraction isn't your phone — it's your own thoughts. 'I should check…', 'I wonder if…', 'Let me just…'",
        "Try this: keep a sticky note next to you. When a thought pops up, write it down and say 'Not now — after the timer.'",
        "Your thought is safe on the note, so your brain can let it go and come back to your work.",
        "After the timer rings, look at the note. Most of the time, the thought can wait even longer."], "Keep a 'not now' sticky note on your desk today."),
    _R("fe4a", "D4", "grow", "Let Paper Do the Remembering", 3, "Why plans in your head keep slipping — and how to fix it.",
       ["Your brain can only hold a few things at once. When you try to remember every test, project and homework in your head, some fall out.",
        "Make a one-page deadline map: everything due in the next two weeks, on one sheet, near your study spot.",
        "Each day, colour your top 3 tasks: red for must-do today, yellow for should-do, green for nice-to-do. Start with red.",
        "When paper remembers, your brain is free to think."], "Make a one-page deadline map this Sunday."),
    _R("fe4b", "D4", "calm", "Calm Mornings Start the Night Before", 2, "Pack your bag tonight and see what changes.",
       ["Rushing in the morning, searching for a lost notebook, forgetting the PE kit — it makes the whole day start badly.",
        "Try packing your bag the night before. Check tomorrow's timetable, pack everything, and leave the bag by the door.",
        "It takes five minutes, and it gives you a calmer morning and one less thing to worry about at school.",
        "Small habits like this make you feel more in charge of your day."], "Pack tomorrow's bag tonight, before bed."),
    _R("fe5a", "D5", "lift", "Smart Kids Ask Questions", 2, "Asking for help isn't weak — it's how learning works.",
       ["Have you ever pretended to understand because you were scared to ask? Lots of students do.",
        "But here's a secret: teachers love questions. A question shows you're thinking, not that you're slow.",
        "Start small. Write your question in your notebook first. Ask it after class if that feels easier.",
        "Every question you ask makes the next one easier."], "Ask one question in class or after class tomorrow."),
    _R("fe5b", "D5", "calm", "Your Brain Can Grow", 3, "Why 'I'm just not a maths person' isn't true.",
       ["Some kids decide early that they're 'bad at maths' or 'not a study person'. But brains don't work like that.",
        "Your brain is like a muscle — it gets stronger when you practise, especially with things that feel hard.",
        "Being stuck is not a sign you can't learn. It's the exact moment your brain is growing.",
        "So next time you feel 'slow', remember: you're not behind. You're on your way."], "Write down one thing you couldn't do last year, but can now."),
    _R("fe6a", "D6", "lift", "Bored? Try Being a Detective", 2, "How curiosity can switch school back on.",
       ["Boredom is a signal from your brain: 'I don't see why this matters.' It's not a sign that you're lazy.",
        "Try being a detective. Ask: 'Where would I use this?' Maths is in cricket scores and recipes. Science is in your bicycle and your phone.",
        "Write one 'I wonder…' question each day and try to find the answer.",
        "Curious brains learn faster and remember more — and they're never bored for long."], "Write one 'I wonder…' question about today's lesson."),
    _R("fe6b", "D6", "grow", "Be Proud of Your Own Effort", 2, "You don't need a gold star to know you did well.",
       ["It's lovely when someone says 'well done'. But if you only work when someone is watching, it's hard to keep going.",
        "Try a proud-of-me note each evening: 'Today I'm proud that I…' — finished a sum, asked a question, didn't give up.",
        "On Sunday, read the week's notes. You'll see how much you've done.",
        "Feeling proud of your own effort is a superpower that lasts."], "Write one proud-of-me line tonight."),
    _R("fe7a", "D7", "calm", "Mistakes Are How Brains Learn", 3, "A wrong answer is information, not a judgement.",
       ["Getting something wrong feels bad. Your cheeks go hot, you want to hide the page. That's normal.",
        "But scientists have found that brains learn the most right after a mistake — when we look at what went wrong.",
        "Try a mistake log: write the mistake and one line on how to fix it. Read it before your next test.",
        "Mistakes don't mean you're bad at something. They mean you're learning it."], "Start a mistake log with one mistake from this week."),
    _R("fe7b", "D7", "lift", "One More Try", 2, "The tiny rule that helps you not give up too early.",
       ["When something is hard, it's tempting to say 'I can't do this' and stop.",
        "Try the one-more rule: after a mistake, give it just one more try — a different way, or with a hint. After that, you can stop if you want.",
        "Often, that one more try is the one that works. And even if it doesn't, you've practised not giving up.",
        "Add 'yet' to your sentences: 'I can't do this yet.' It's more true."], "Use the one-more rule on the next hard question."),
    _R("fe8a", "D8", "calm", "Sleep: Your Brain's Secret Weapon", 3, "Why a steady bedtime makes focus so much easier.",
       ["At your age, you need about 9-11 hours of sleep. When you sleep less, attention is one of the first things to suffer.",
        "Screens in bed keep your brain awake, even when you feel tired. Moving your phone out of the room 30 minutes before bed helps a lot.",
        "Try to sleep and wake at about the same time every day — even weekends. Your body clock loves a routine.",
        "Good sleep tonight means better focus tomorrow."], "Charge your phone outside your room tonight."),
    _R("fe8b", "D8", "grow", "Fuel Up: Breakfast, Water, Sunlight", 2, "Three easy habits that power your brain.",
       ["Your brain uses a lot of energy. Skipping breakfast is like starting a car with an empty tank.",
        "Eat something before school — fruit, milk, poha, a paratha. Keep a water bottle in your bag and sip through the day.",
        "Spend 15 minutes outside every day. Daylight and play wake your brain up and help you sleep better.",
        "These are small habits, but they make a big difference to how you feel in class."], "Eat breakfast and drink 4 glasses of water tomorrow."),
    _R("fe9a", "D9", "calm", "Calm Body, Clear Brain", 2, "When you're upset, breathe first — then think.",
       ["When you feel nervous, angry or overwhelmed, your brain's alarm goes off. It's hard to think clearly when the alarm is loud.",
        "The fastest way to turn it down is your breath. Breathe in for 4, hold for 7, and breathe out slowly for 8.",
        "Do it three times. Your heart slows down, and the thinking part of your brain switches back on.",
        "You always carry this tool with you — in class, at home, before a test."], "Try 4-7-8 breathing once today, even when you feel fine."),
    _R("fe9b", "D9", "lift", "Name the Feeling", 2, "One word can make a big feeling smaller.",
       ["Before homework, try a 60-second check-in: 'How do I feel right now?' Give it one word — tired, worried, cross, calm.",
        "Naming a feeling helps your brain understand it, and that makes it less powerful.",
        "If the word is heavy, take three slow breaths or talk to an adult before you start.",
        "Feelings aren't good or bad. They're just messages — and you can listen to them."], "Do a 60-second check-in before your homework today."),
    _R("fe10a", "D10", "grow", "Build Your Study Spot", 2, "Where you study changes how well you focus.",
       ["Studying on a bed, in front of the TV or at a crowded table makes focus much harder.",
        "Ask a parent to help you set up one study spot: a chair, a table, good light, and your phone somewhere else.",
        "Keep only three things on the desk — your book, a pen and a water bottle. Face a wall if you can.",
        "Same spot, same time every day — and your brain will learn 'this is focus time'."], "Ask a parent: 'Can you help me set up a study spot?'"),
    _R("fe10b", "D10", "lift", "Study Buddies Make It Easier", 2, "Working next to someone helps you start and keep going.",
       ["Doing homework alone can feel slow and lonely. Having someone working next to you makes it easier.",
        "Find a study buddy — a friend, a sibling, a cousin. Work for 25 minutes, then chat for 5.",
        "You don't need to help each other with every answer. Just knowing someone else is working helps you focus.",
        "Learning together is how lots of great ideas begin."], "Ask one friend to do homework at the same time this week."),
]

AREA_NUDGE = {
    "D1": "For your focus: one 25-minute burst with your phone in another room.",
    "D2": "For getting started: just 2 minutes on the task you've been avoiding.",
    "D3": "For distractions: phone out of sight, and 'not now, after the timer'.",
    "D4": "For planning: colour today's top 3 tasks and start with the red one.",
    "D5": "For confidence: ask one question today — teachers love questions.",
    "D6": "For motivation: write one 'I wonder…' question about something you learned.",
    "D7": "For bouncing back: after a mistake, give it just one more try.",
    "D8": "For energy: breakfast, water, and phone out of the bedroom tonight.",
    "D9": "For calm: three slow breaths before you open your books.",
    "D10": "For support: ask a friend or parent to sit with you while you study.",
}
MOOD_NUDGE = {
    0: ("Be extra gentle with yourself today", "Today feels heavy, and that's okay. Do just one tiny thing, and tell a grown-up you trust how you feel."),
    1: ("One small step is enough", "Rough days happen to everyone. Pick the easiest task, do a 2-minute start, and be proud of that."),
    2: ("Mixed days still count", "Some bits good, some not so good — that's normal. Notice one thing that went right today."),
    3: ("You're finding your rhythm", "You're feeling steady — that's something you've built. Keep your small habits going."),
    4: ("Let this good energy grow", "You're feeling strong! Use this energy for one 25-minute focus burst on something that matters."),
}
WELLNESS = {"EXERCISES": EXERCISES, "GAMES": GAMES, "ARTICLES": ARTICLES, "AREA_NUDGE": AREA_NUDGE, "MOOD_NUDGE": MOOD_NUDGE,
            "AREA_NAMES": {a["key"]: a["name"] for a in AREAS}, "DEFAULT_PRI": ["D1", "D2", "D3"]}

# Shorts / audiobooks / videos for ages 11-13 (seeded into `media` with programme="focusedge")
SEED_MEDIA = [
    ("short", "Swirling — Settle Your Thoughts", "3 min", "ixeuFRqzlNk"),
    ("short", "Taking Deep Breaths Before a Test", "2 min", "e2j7S8dy8j0"),
    ("short", "Box Breathing in One Minute", "1 min", "tEmt1Znux58"),
    ("short", "Gentle Forest Stream", "0:21", "o_F5Sj524T0"),
    ("short", "1-Minute Lake Calm", "1 min", "9SDqHAB1lRo"),
    ("audiobook", "The Calm Dragon's Sleepy Breath", "Story", "K1uuPCAi-c0"),
    ("audiobook", "Peaceful Moments — Guided Calm", "10 min", "mK2UxmH-i48"),
    ("audiobook", "Climbing Up — Confidence Journey", "Guided", "bXmq5idN23E"),
    ("audiobook", "Breathe With Me", "Guided", "2PYHmihv3wY"),
    ("video", "The Power of 'Yet'", "Short film", "46UhAtPyXw4"),
    ("video", "Growth Mindset — Your Brain Can Grow", "5 min", "2zrtHt3bBmQ"),
    ("video", "How to Focus Without Getting Distracted", "Tips", "VRvGWRp4FTA"),
    ("video", "5 Mindfulness Exercises for Kids", "Guided", "Wsy2L9VvX90"),
    ("video", "Guided Meditation for Students", "Guided", "K4YoQHjaziI"),
    ("video", "25-Minute Focus Timer (Pomo-25)", "25 min", "eeI_IB4aLYI"),
    ("video", "Headspace for Kids: Paying Attention", "Guided", "N32dOgiTqQA"),
]
