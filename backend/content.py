SCALE = [
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Rarely"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Often"},
    {"value": 4, "label": "Almost always"},
]

_BANK = {
    "A": ("Academic & Workload", "Academic", {
        "A1": ("Workload volume & deadline pressure", [
            "Deadlines pile up and I can't tell where to start.",
            "Submissions from different subjects fall in the same week.",
            "There is more work than hours in a day to do it.",
            "Even completing one assignment feels like a race against time.",
            "I lose personal time because academic work keeps expanding.",
            "I underestimate how long tasks will take, and I run out of time.",
            "New assignments arrive before I have finished the previous ones.",
            "I have little room to pause between academic deliverables.",
        ]),
        "A2": ("Overwhelm, avoidance & procrastination", [
            "I avoid academic tasks because they feel too big to start.",
            "I open my laptop to study and end up scrolling for a long time.",
            "I keep moving one task to the next day without starting it.",
            "I feel paralysed when I look at my pending work list.",
            "I start late on tasks even when I know they are important.",
            "I feel stuck in a cycle of worry and avoidance about studies.",
            "I do easier tasks to avoid harder ones that actually matter.",
            "The thought of starting a task is harder than doing it.",
        ]),
        "A3": ("Concentration & cognitive strain", [
            "Study-related worry makes it hard to concentrate.",
            "I re-read the same page without taking anything in.",
            "My mind drifts away from the task even when I try to focus.",
            "I feel mentally foggy after a few demanding days of academics.",
            "I forget things I just read or heard in class.",
            "I need more breaks than usual to get through study sessions.",
            "I feel mentally exhausted before the academic day is over.",
        ]),
        "A4": ("Performance pressure & self-evaluation", [
            "I feel I need to do well on everything, not just what matters.",
            "One bad grade or test makes the whole week feel wrong.",
            "I worry about disappointing teachers, mentors or guides.",
            "I compare my academic performance with classmates frequently.",
            "I feel I am falling behind the people around me academically.",
            "I feel academic success is tied to who I am as a person.",
            "Even when I do well, I immediately worry about the next test.",
        ]),
    }),
    "B": ("Body & Sleep", "Body & Sleep", {
        "B1": ("Sleep timing & quantity", [
            "I feel tired because screens or work push my sleep later.",
            "I sleep fewer hours than I know I need.",
            "My bedtime varies a lot from one night to the next.",
            "I stay up late even when I have a full day ahead.",
            "I lose an hour or more to my phone after lying down.",
            "I wake up earlier than I want to and can't fall asleep again.",
            "I keep trying to 'catch up' on sleep on weekends.",
            "I feel I never have a stretch of nights with proper sleep.",
        ]),
        "B2": ("Sleep quality & disturbed sleep", [
            "Stress makes it hard to fall asleep.",
            "I wake up during the night and struggle to go back to sleep.",
            "I grind my teeth or wake up with a tight jaw.",
            "My thoughts get louder once I lie down in bed.",
            "I wake up and feel I did not really rest.",
            "I have unsettling or stress-themed dreams.",
            "I feel physically tense when I try to sleep.",
        ]),
        "B3": ("Daytime energy & fatigue", [
            "I feel foggy or low on energy during the day.",
            "I rely on tea, coffee or energy drinks to function.",
            "I crash in the afternoon and struggle to recover.",
            "Small tasks feel heavier than they should.",
            "I feel physically drained even without doing much.",
            "My body feels sore or stiff from stress or sitting still too long.",
            "I zone out during conversations because I'm so tired.",
            "I feel I am always a step behind my body's needs.",
        ]),
        "B4": ("Basic physical self-care", [
            "I skip meals or forget to drink water when I'm busy.",
            "I eat whatever is easiest rather than what my body needs.",
            "I don't get any proper movement or walking in my day.",
            "I rarely get fresh air or daylight during a typical day.",
            "I notice headaches, acidity or stomach aches more often.",
            "I ignore minor health issues until they become bigger.",
            "My appetite feels off (too little or too much) because of stress.",
        ]),
    }),
    "C": ("Emotional Load & Coping", "Emotional", {
        "C1": ("Overwhelm & distress intensity", [
            "I feel overwhelmed and can't shake it off quickly.",
            "Small problems feel much bigger than they should.",
            "I feel like I am running on edge most of the day.",
            "I feel I have no space left in my head for anything new.",
            "Stress symptoms spill into my sleep, appetite or focus.",
            "I feel I can barely keep up with everyday things.",
            "Even small changes to my plan feel too much to handle.",
            "I feel one more thing could tip me over.",
        ]),
        "C2": ("Anxiety & restlessness", [
            "I feel on edge or anxious without a clear reason.",
            "My heart races or my breathing speeds up when I'm not active.",
            "I worry about things that haven't happened yet.",
            "I feel restless and can't sit still for long.",
            "I notice knots in my stomach or a tight chest.",
            "I expect something bad is about to happen.",
            "I replay stressful moments long after they are over.",
        ]),
        "C3": ("Low mood & motivation", [
            "I feel low or unmotivated even when nothing specific is wrong.",
            "Things I usually enjoy feel flat or not worth the effort.",
            "I feel disconnected from my day as it passes.",
            "I cry more easily than usual, or feel like crying.",
            "I feel heavy or weighed down when I wake up.",
            "Making small decisions feels harder than it used to.",
            "I feel less interested in future plans I was looking forward to.",
            "I feel like I'm just going through the motions.",
        ]),
        "C4": ("Avoidant / escape coping", [
            "I use scrolling, gaming or snacks to switch off difficult feelings.",
            "I binge-watch content late into the night to avoid thinking.",
            "I overeat or lose interest in food when I'm stressed.",
            "I buy or shop more than I planned to feel better.",
            "I distract myself rather than face what is actually bothering me.",
            "I zone out on my phone instead of doing what I set out to do.",
            "I rely on substances (alcohol, tobacco, caffeine) to cope.",
        ]),
    }),
    "D": ("Social & Belonging", "Social", {
        "D1": ("Loneliness & lack of honest connection", [
            "I don't have anyone I can talk to honestly.",
            "I feel alone with my problems.",
            "I feel surrounded by people and still disconnected.",
            "I miss having someone who understands me without explanation.",
            "I spend most of my evenings alone with my thoughts.",
            "I feel I have lost touch with people I used to be close to.",
            "My conversations stay surface-level even when I want more.",
            "I feel invisible in the groups I'm part of.",
            "I often feel lonely, even when I'm busy with classes and work.",
            "I wish my near and dear ones were around me.",
        ]),
        "D2": ("Hiding distress & shame about help-seeking", [
            "I keep my distress to myself and feel ashamed of needing help.",
            "I say 'I'm fine' when I'm not.",
            "I feel I will be judged if I ask for help with how I'm feeling.",
            "I don't want to be seen as weak or dramatic.",
            "I feel I should be able to handle this on my own.",
            "I hide how badly things are going from my family.",
            "I worry about becoming a burden if I open up.",
        ]),
        "D3": ("Relationship stress, breakup & conflict", [
            "A recent breakup, rejection or conflict with someone close is still affecting me.",
            "I keep thinking about a relationship that ended or is strained.",
            "I feel let down by someone close to me.",
            "I have an unresolved argument with someone close.",
            "I feel I am losing a friendship or close bond that mattered to me.",
            "I feel unsupported by my partner, best friend or family right now.",
            "Seeing a person or their updates still hurts.",
            "I had to end a connection that was hurting me, and it still weighs on me.",
        ]),
        "D4": ("Belonging, homesickness & distance from family", [
            "I miss home or familiar people in a way that affects daily life.",
            "Living away from my parents and family makes everyday stress feel heavier.",
            "I don't talk to my parents, siblings or childhood friends as often as I'd like.",
            "I feel detached from my family since moving away for my studies.",
            "I feel no one here knows me the way the people back home do.",
            "I feel I don't fit in with the people around me.",
            "I struggle to make new friends in my current environment.",
            "I feel out of place in my hostel, class or workplace.",
            "I feel I am 'performing' to fit in rather than being myself.",
            "I feel disconnected from my cultural or family roots here.",
            "I feel I don't belong in the course or path I am on.",
        ]),
    }),
    "E": ("Identity & Self-worth", "Identity", {
        "E1": ("Comparison & imposter feelings", [
            "I compare my progress with others and feel behind.",
            "I feel like a fraud when I am praised or do well.",
            "I feel other people are more capable or sorted than I am.",
            "Social media makes me feel I am not doing enough.",
            "I minimise my achievements when I talk about them.",
            "I think my success so far has been luck, not ability.",
            "I feel I will be found out as not good enough.",
            "I measure myself against the best people in every room.",
        ]),
        "E2": ("Self-criticism & 'not good enough'", [
            "I feel I am not good enough even when I am doing well.",
            "I replay my mistakes in my head long after they happen.",
            "I am harder on myself than I would ever be on a friend.",
            "I notice my flaws more easily than my strengths.",
            "I feel I disappoint myself regularly.",
            "I set standards for myself that even I know are too high.",
            "One failure feels like proof I am not capable.",
        ]),
        "E3": ("Rest-guilt & pressure to prove", [
            "I feel guilty when I rest or take a break.",
            "I feel I have to prove something so I don't disappoint others.",
            "I feel I don't deserve downtime unless I have 'earned' it.",
            "I keep working even when I'm exhausted because stopping feels wrong.",
            "I feel I need to look busy even when I don't need to be.",
            "I say yes to things I don't want to, so I don't let people down.",
            "I feel my worth depends on how much I accomplish.",
            "I feel I owe my family or mentors more than I am giving.",
        ]),
        "E4": ("Self-doubt & uncertainty about ability", [
            "I doubt I can handle what is ahead of me.",
            "I second-guess decisions I have already made.",
            "I feel I don't know what I am really good at.",
            "I feel confused about what I truly want.",
            "I feel smaller than I used to feel.",
            "I feel I have changed for the worse in the last few months.",
            "I feel I can't trust my own judgement right now.",
        ]),
    }),
    "F": ("Family, Money & Future", "Family & Future", {
        "F1": ("Money worry & financial pressure", [
            "I worry about money or my family's financial pressure.",
            "I feel guilty about the cost of my course or living expenses.",
            "I avoid buying things I need because of money stress.",
            "I feel pressure to start earning quickly.",
            "Fee or hostel payments cause tension at home.",
            "I think about my family's finances more than I would like to.",
            "I feel I am a financial burden on my family.",
            "Everyday expenses add up and worry me.",
        ]),
        "F2": ("Family expectations & communication", [
            "I feel the weight of my family's expectations.",
            "My family and I disagree about my course, career or life choices.",
            "I feel I am living someone else's plan more than my own.",
            "I feel I cannot tell my family what I actually want.",
            "Family calls or visits feel tense right now.",
            "I feel I need to protect my family from how I'm really doing.",
            "I feel I owe my family a particular future that may not fit me.",
        ]),
        "F3": ("Future direction & career uncertainty", [
            "I feel unsure about my future path and it stresses me out.",
            "I worry I am falling behind the career 'timeline' I should be on.",
            "I feel pressure to pick a direction before I'm ready.",
            "I worry about placements, internships or admissions ahead.",
            "I feel I don't have a plan for after this year.",
            "I compare my career progress with peers and feel anxious.",
            "Big life questions (what next, where to go) keep looping in my head.",
            "I feel the field I want to enter is harder to break into than I expected.",
        ]),
        "F4": ("Family money-talk & future-talk avoidance", [
            "I avoid talking about money or my future with my family.",
            "I don't tell my family what I'm actually spending on.",
            "I avoid discussing options I'm considering because of the reaction.",
            "I feel ashamed to raise financial topics with my parents.",
            "I postpone big conversations about my future to avoid stress.",
            "I don't ask for help with money or planning because I worry about judgement.",
            "I feel I need to look like I have it figured out to my family.",
        ]),
    }),
}

AREAS = []
SUBTHEMES = {}
ITEMS = {}
for akey, (aname, ashort, subs) in _BANK.items():
    AREAS.append({"key": akey, "name": aname, "short": ashort})
    for skey, (sname, texts) in subs.items():
        SUBTHEMES[skey] = {"key": skey, "area": akey, "name": sname}
        for i, t in enumerate(texts, 1):
            iid = f"{skey}-{i:02d}"
            ITEMS[iid] = {"id": iid, "area": akey, "subtheme": skey, "text": t, "status": "active"}

AREA_BY_KEY = {a["key"]: a for a in AREAS}

THEORY = {
    "A": "When too many deadlines sit in your head at once, your brain can't tell where to start — so it starts avoiding. The way out isn't working harder; it's making the first step so small you can't refuse it. Three visible things always beats a vague pile of 'everything'.",
    "B": "Sleep is where your brain repairs mood, memory and focus. When sleep is short or broken, everything else (attention, motivation, patience, feelings) runs on low battery. This isn't about discipline — it's about restoring the fuel. Your wake-up time, more than your bedtime, is what resets your body clock.",
    "C": "When stress builds without a release, your body stays switched on — so small things feel big and rest doesn't feel restful. You can't think your way out of a racing body; calming the body first lets the thoughts follow. Naming what you feel, even with one word, can lower its intensity.",
    "D": "Carrying stress alone — especially after a breakup, a loss or a conflict with someone close — makes everything heavier. Grief after a relationship ends is real and takes real time; it's not a weakness. You don't need a therapist for your first honest conversation; you need one person and one honest sentence.",
    "E": "Comparison and self-criticism can feel like motivation, but they mostly drain the energy you need for the actual work. Your mind notices what is undone far more than what is done, so the picture you carry of yourself is skewed. Writing down what you did — every night — slowly corrects that picture.",
    "F": "Money, family expectations and the future feel heavy because they seem too big to discuss and too important to ignore. Avoiding the conversation keeps the worry looping without any new information. One short, planned conversation usually shrinks the problem to its real size.",
}

_A = lambda id, name, short, time, steps, when: {"id": id, "name": name, "short": short, "time": time, "steps": steps, "when": when}

ACTIVITIES = {
    "A": [
        _A("a-10min", "The 10-minute start", "10-min start", "10 min, once a day", [
            "Pick the task you've been avoiding most. Write the first step in one sentence (e.g. 'open the lab manual and write the aim').",
            "Set a 10-minute timer. Do only that step. Phone in another room.",
            "When the timer rings, you're allowed to stop. Most of the time, you'll keep going."], "For the task you've been avoiding most"),
        _A("a-top3", "Morning top-3", "Top-3", "3 min, each morning", [
            "Before touching your phone, write 3 tasks that MUST be done today.",
            "Everything else waits. Three realistic things beats ten imagined ones.",
            "Tick each one off physically — the small win keeps the next task possible."], "Any day with more than one deadline"),
        _A("a-focus", "Two 25-minute focus blocks", "Focus blocks", "50 min, once a day", [
            "Put your phone in another room and close every tab you don't need.",
            "Work for 25 minutes on one task, then take a 5-minute break away from screens.",
            "Repeat once. Two honest blocks beat a whole distracted evening."], "When studying keeps turning into scrolling"),
        _A("a-shutdown", "Shutdown ritual", "Shutdown", "5 min, at a fixed stop time", [
            "Pick a fixed time to stop academic work for the day.",
            "Write down where you stopped and the very next step for tomorrow.",
            "Close the laptop and say 'done for today' — the plan is safe on paper."], "When work keeps spilling into the night"),
        _A("a-map", "Deadline map on one page", "Deadline map", "15 min, every 1-2 weeks", [
            "List every submission, test and lab for the next two weeks on one page.",
            "Mark the clashes and the one task that unlocks the most others.",
            "Decide what to start first — and who to ask if two deadlines collide."], "When deadlines feel like a blur"),
    ],
    "B": [
        _A("b-phone", "Phone across the room", "Phone away", "30 sec tonight", [
            "Charge your phone across the room (or outside it) 30 minutes before you want to sleep.",
            "Use a cheap alarm clock, or set the phone's alarm with volume loud enough.",
            "If you need something to do, read a printed page or listen to music lying down."], "Any night you want sleep back"),
        _A("b-dump", "The 5-minute brain dump", "Brain dump", "5 min, before bed", [
            "Open a notebook. Write every worry, task and thought in your head — ugly, incomplete, unfiltered.",
            "Circle the top 3 for tomorrow.",
            "Close the book. The worries now live on paper, not in your head."], "When your mind won't switch off"),
        _A("b-wake", "Fixed wake-up time", "Wake", "0 min, every morning", [
            "Choose one wake-up time you can keep all 7 days (within 30 minutes).",
            "Keep it on weekends too — this, more than bedtime, resets your body clock.",
            "If you slept badly, still get up on time; nap no more than 20 minutes."], "When your sleep timing keeps drifting"),
        _A("b-daylight", "Daylight within 30 minutes of waking", "Daylight", "10 min, each morning", [
            "Within 30 minutes of waking, step onto a balcony or walk outside.",
            "Stay 5-10 minutes without sunglasses if it's safe and comfortable.",
            "Pair it with something you already do — tea, brushing, the walk to class."], "When mornings feel foggy"),
        _A("b-caffeine", "No caffeine after 2 pm", "No late caffeine", "0 min, all day", [
            "Have your last tea, coffee or energy drink before 2 pm.",
            "Swap the afternoon cup for water, a short walk or a snack.",
            "Notice your sleep over a week rather than judging one night."], "When you fall asleep late or wake often"),
        _A("b-20min", "The 20-minute get-up rule", "Get-up rule", "As needed, at night", [
            "If you've been awake in bed for about 20 minutes, get up.",
            "Sit somewhere dim and do something calm and boring — no phone.",
            "Go back to bed only when you feel sleepy again."], "When you lie awake and the thoughts get loud"),
    ],
    "C": [
        _A("c-breath", "4-7-8 breathing", "Breathing", "1 min, when a loop starts", [
            "Breathe in through your nose for 4 counts.",
            "Hold for 7 counts, then breathe out slowly through your mouth for 8 counts.",
            "Do two rounds. Then name one thing you can see, hear and feel."], "When worry or tension starts to spiral"),
        _A("c-checkin", "60-second check-in", "Check-in", "1 min, once a day", [
            "Rate your stress from 0 to 10.",
            "Write one word for what you're feeling right now.",
            "Notice it without fixing it. Patterns become clear within a week."], "Every day, especially busy ones"),
        _A("c-worry", "Worry check on paper", "Worry check", "5 min, when needed", [
            "Write the worrying thought exactly as it sounds in your head.",
            "List the evidence for it and the evidence against it.",
            "Write a fairer version of the thought — one you'd say to a friend."], "When one thought keeps replaying"),
        _A("c-joy", "15 minutes of non-screen enjoyment", "Non-screen 15", "15 min, once a day", [
            "Pick something small you used to enjoy that doesn't need a screen.",
            "Do it for 15 minutes — music, a walk, sketching, cooking, a game.",
            "Notice how you feel after, even if you didn't feel like starting."], "When things feel flat or heavy"),
    ],
    "D": [
        _A("d-honest", "One honest sentence", "One sentence", "2 min, once a day", [
            "Pick one person you trust (friend, cousin, roommate). Not for advice — just to be heard.",
            "Send one honest sentence: 'The week is a lot, and I've been keeping it to myself.'",
            "That's it. You don't owe them a solution. You've just shared the weight."], "Any day you'd normally say 'I'm fine'"),
        _A("d-reset", "Low-contact reset (if a breakup is weighing on you)", "Low-contact", "10 min, once this week", [
            "Mute (not block) their social-media accounts and move the chat thread out of your main view.",
            "Pick one person who will hear you vent without fixing — tell them you may need them this week.",
            "Allow yourself a 'feel-it' hour: play one song, write one page, then do a 25-min focus block."], "When seeing their updates keeps re-opening the wound"),
        _A("d-nextto", "Study next to someone", "Study together", "1 hour, twice a week", [
            "Pick the library, a common room or a friend's desk instead of studying alone.",
            "You don't need to talk — just work in the same space.",
            "Take one short break together and ask how their week is going."], "When evenings feel lonely"),
        _A("d-call", "A 15-minute call home", "Call home", "15 min, twice a week", [
            "Call someone at home at a time you're both free.",
            "Share one real update — not just 'all fine'.",
            "Ask them one question about their week too."], "When you miss home or feel far away"),
        _A("d-join", "Join one low-pressure activity", "Join one", "1 hour, once a week", [
            "Pick one recurring club, sport or group that has nothing to do with grades.",
            "Go twice before deciding if it's for you.",
            "Say hello to one person each time."], "When you feel you don't quite fit in"),
    ],
    "E": [
        _A("e-three", "Three-things-I-did list", "Three things", "3 min, each night", [
            "Before bed, write three things you actually did today — however small.",
            "Not what's undone. Only what you did.",
            "Read last week's list on Sunday; notice the evidence."], "When you feel you're never doing enough"),
        _A("c-worry", "Worry check on paper", "Worry check", "5 min, when needed", [
            "Write the self-critical thought exactly as it sounds in your head.",
            "List the evidence for it and the evidence against it.",
            "Write a fairer version of the thought — one you'd say to a friend."], "When comparison or self-doubt keeps looping"),
        _A("c-joy", "15 minutes of non-screen enjoyment", "Non-screen 15", "15 min, once a day", [
            "Pick something small you enjoy that doesn't need a screen.",
            "Do it for 15 minutes — rest doesn't have to be earned.",
            "Notice the guilt if it shows up, and do it anyway."], "When rest feels like guilt"),
    ],
    "F": [
        _A("f-money", "20-minute money conversation", "Money talk", "20 min, once this fortnight", [
            "Ask a parent or guardian for 20 minutes at a calm time.",
            "Use the script: 'Can we go through what's due and the options?'",
            "Write down what you agreed and one next step."], "When money worry keeps looping"),
        _A("f-faculty", "Deadline or plan conversation with faculty", "Faculty talk", "10 min, once", [
            "Email or visit a faculty member or mentor during office hours.",
            "Share the clash or question in two sentences.",
            "Ask which to prioritise, or whether a short extension is possible."], "When deadlines or direction feel stuck"),
        _A("f-senior", "One 15-minute talk with a senior", "Senior talk", "15 min, once a semester", [
            "Find a senior in your branch or programme you can approach.",
            "Ask what they wish they'd known about placements, internships or next steps.",
            "Write down one idea you can try this month."], "When the future feels unclear"),
    ],
}

LOOP_FRAGMENTS = {
    "A": "Pile-up & avoidance", "B": "Short, broken sleep", "C": "On edge & overwhelmed",
    "D": "Carrying it alone", "E": "Comparison & self-doubt", "F": "Money & future worry",
}

AREA_PHRASES = {
    "A": "deadlines and workload are crowding your days",
    "B": "your sleep and energy are running low",
    "C": "your emotional load feels heavy and hard to switch off",
    "D": "you may be carrying more of this on your own than you'd like",
    "E": "comparison and self-criticism are taking up space",
    "F": "money, family expectations or the future are weighing on you",
}

FATIGUE_ITEMS = {"A3-04", "A3-07"} | {i for i in ITEMS if i.startswith("B3") or i.startswith("C3")}

BODY_TABLE = [
    {"cause": "Vitamin D", "signs": "Low energy, low mood, aches, poor sleep — very common in students who stay indoors.", "check": "Vitamin D (25-OH) blood test"},
    {"cause": "Vitamin B12", "signs": "Tiredness, brain fog, low mood. Common on vegetarian / vegan diets.", "check": "Vitamin B12 blood test"},
    {"cause": "Iron (anaemia)", "signs": "Tiredness, breathlessness, poor focus, hair fall. Common in young women; worth checking if periods are heavy.", "check": "CBC and ferritin / iron studies"},
    {"cause": "Thyroid (TSH)", "signs": "Tiredness, weight change, feeling cold — or anxiety and poor sleep.", "check": "One blood test rules it in or out"},
    {"cause": "Meals & hydration", "signs": "Afternoon crashes, mood swings, headaches from skipping meals, low protein or not enough water.", "check": "Three regular meals and water through the day"},
    {"cause": "Movement & daylight", "signs": "Low mood and poor sleep from very little walking or sunlight.", "check": "20-30 min of either most days can help"},
]

SCRIPTS = [
    {"to": "To a counsellor", "text": "My sleep's been bad and things are piling up. I've mostly kept this to myself. I'd like help getting my routine back."},
    {"to": "To a parent (money)", "text": "I've been feeling guilty about the course costs. Can we spend 20 minutes going through what's due and the options?"},
    {"to": "To a faculty (deadline)", "text": "Two submissions fall in the same week. Could we agree which to prioritise, or could I have a short extension on one?"},
]

DEMO_USERS = [
    {"id": "stu-ananya", "role": "student", "name": "Ananya Rao", "program": "B.Tech, Computer Science", "level": "UG", "year": "2nd year", "institution": "Demo University", "student_code": "EQ-UG-2041"},
    {"id": "stu-rohan", "role": "student", "name": "Rohan Verma", "program": "MBA", "level": "PG", "year": "1st year", "institution": "Demo University", "student_code": "EQ-PG-1187"},
    {"id": "stu-meera", "role": "student", "name": "Meera Iyer", "program": "B.A. Psychology", "level": "UG", "year": "3rd year", "institution": "Demo University", "student_code": "EQ-UG-3302"},
    {"id": "cou-kavya", "role": "counsellor", "name": "Dr. Kavya Menon", "program": "Campus Counsellor · Wellness Centre", "level": "", "year": "", "institution": "Demo University", "student_code": ""},
    {"id": "adm-platform", "role": "admin", "name": "Platform Admin", "program": "Biglyp wellbeing team", "level": "", "year": "", "institution": "Biglyp", "student_code": ""},
]

# ---- programme config (shared engine contract; see content_mm.py for MindMellow)
PROGRAMME = "equimind"
NAME = "EquiMind"
AUDIENCE = "Indian university students (UG and PG)"
BODY_AREA, EMO_AREA = "B", "C"
WELLNESS_MAP = {k: k for k in "ABCDEF"}
PLAN_START = "b-wake"
PLAN_CHECKIN = "c-checkin"
PLAN_FILLERS = ["b-dump", "b-phone", "a-top3", "c-breath"]
_ACT_BY_ID = {a["id"]: a for v in ACTIVITIES.values() for a in v}
for _u in DEMO_USERS:
    _u.setdefault("programme", "equimind")


def act(aid):
    return _ACT_BY_ID[aid]


# ---------------------------------------------------------------- "About you" context (EquiMind only, asked before the 24 items)
CONTEXT_QUESTIONS = [
    {"key": "living", "text": "Where are you staying right now?", "options": [
        ("family", "At home with my parents / family"),
        ("hostel", "In a hostel or PG, away from my parents"),
        ("alone", "Alone in a rented room or flat"),
        ("relatives", "With relatives or friends, away from my parents"),
        ("na", "Prefer not to say")]},
    {"key": "contact", "text": "How often do you talk or video-call with your parents, siblings or childhood friends?", "options": [
        ("daily", "Every day"), ("weekly_few", "A few times a week"), ("weekly", "About once a week"),
        ("rarely", "Rarely — less than once a week"), ("hardly", "Hardly ever"), ("na", "Prefer not to say")]},
    {"key": "lonely", "text": "In the last two weeks, how often have you felt lonely or missed having your near and dear ones around you?", "options": [
        ("never", "Never"), ("rarely", "Rarely"), ("sometimes", "Sometimes"), ("often", "Often"), ("always", "Almost always"), ("na", "Prefer not to say")]},
]
AWAY = {"hostel", "alone", "relatives"}
YOU = {"living": {"hostel": "living in a hostel or PG, away from your parents", "alone": "living alone in a rented room or flat",
                  "relatives": "living with relatives or friends, away from your parents"},
       "contact": {"rarely": "talk to family less than once a week", "hardly": "hardly ever talk to family"}}
SHORT = {"living": {"hostel": "Hostel/PG", "alone": "Lives alone", "relatives": "With relatives/friends"},
         "contact": {"rarely": "family contact < weekly", "hardly": "hardly any family contact"}}


def context_summary(ctx, areas):
    """Turn the 'About you' answers into a gentle signal: living away from family + little contact or frequent loneliness."""
    if not ctx:
        return None
    labels = {q["key"]: dict(q["options"]) for q in CONTEXT_QUESTIONS}
    away = ctx.get("living") in AWAY
    low_contact = ctx.get("contact") in ("rarely", "hardly")
    lonely = ctx.get("lonely") in ("often", "always")
    social = next((a["score"] for a in areas if a["key"] == "D"), 100)
    detachment = away and (low_contact or lonely or social < 50)
    return {**{k: ctx.get(k) for k in labels}, "labels": {k: labels[k].get(ctx.get(k), "") for k in labels},
            "you": {k: YOU[k].get(ctx.get(k), "") for k in YOU}, "short": {k: SHORT[k].get(ctx.get(k), "") for k in SHORT},
            "away": away, "low_contact": low_contact, "feels_lonely": lonely, "detachment": detachment}
