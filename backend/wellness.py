"""Personalised daily wellness content: guided exercise, brain game, wellness reads, daily nudge."""
from datetime import datetime, timezone

MOODS = ["Struggling", "Rough", "Mixed", "Steady", "Strong"]

# ---------------------------------------------------------------- exercises
_B = lambda inhale, hold, exhale, hold2, cycles: {"inhale": inhale, "hold": hold, "exhale": exhale, "hold2": hold2, "cycles": cycles}

EXERCISES = [
    {"id": "box_breath", "name": "Box Breathing", "kind": "breath", "minutes": 2, "areas": ["C", "A"], "calming": True,
     "intro": "Four slow sides of a square. A simple rhythm that tells your body it is safe to slow down.",
     "pattern": _B(4, 4, 4, 4, 4), "finish": "Lovely. Notice how your shoulders feel now — that softness is something you created."},
    {"id": "breath_478", "name": "4-7-8 Wind-Down Breath", "kind": "breath", "minutes": 2, "areas": ["B", "C"], "calming": True,
     "intro": "A long, unhurried out-breath that helps your body shift into rest mode — great before sleep.",
     "pattern": _B(4, 7, 8, 0, 4), "finish": "Well done. Your body knows how to rest — you just reminded it."},
    {"id": "calm_sigh", "name": "The Calming Sigh", "kind": "breath", "minutes": 1, "areas": ["C", "E", "D"], "calming": True,
     "intro": "A deep breath in, a little top-up sip, then a long easy sigh out. The quickest reset your body has.",
     "pattern": _B(4, 1, 7, 0, 5), "finish": "Beautiful. One minute, and you already gave yourself a little more space."},
    {"id": "grounding", "name": "5-4-3-2-1 Grounding", "kind": "steps", "minutes": 3, "areas": ["C", "D", "F"], "calming": True,
     "intro": "Gently bring your attention back to the room you are in, one sense at a time.",
     "steps": [{"text": "Look around and name 5 things you can see.", "secs": 30},
               {"text": "Notice 4 things you can feel — your feet, the chair, your sleeves.", "secs": 30},
               {"text": "Listen for 3 sounds, near or far.", "secs": 25},
               {"text": "Find 2 things you can smell (or 2 smells you love).", "secs": 20},
               {"text": "Name 1 thing you like about yourself today.", "secs": 20}],
     "finish": "You are here, and you are okay. That steady feeling is yours to come back to any time."},
    {"id": "body_release", "name": "Shoulder-to-Toe Release", "kind": "steps", "minutes": 3, "areas": ["B", "C"], "calming": True,
     "intro": "Tense a little, then let go. Your muscles learn what relaxed feels like.",
     "steps": [{"text": "Lift your shoulders to your ears. Hold… and drop them with a sigh.", "secs": 20},
               {"text": "Make two tight fists. Squeeze… and open your hands slowly.", "secs": 20},
               {"text": "Scrunch your face, then let your jaw hang loose.", "secs": 20},
               {"text": "Press your feet into the floor, then let them go soft.", "secs": 20},
               {"text": "Take one slow breath and feel your whole body a little lighter.", "secs": 20}],
     "finish": "That calm, heavy feeling is your body thanking you. Keep it with you."},
    {"id": "two_minute_start", "name": "The Two-Minute Start", "kind": "steps", "minutes": 3, "areas": ["A", "F"], "calming": False,
     "intro": "Big tasks feel lighter once you take one tiny, doable step. Let's find yours.",
     "steps": [{"text": "Think of one task that has been sitting on your mind.", "secs": 20},
               {"text": "Shrink it: what is the smallest first step? (Open the file, write the title…)", "secs": 30},
               {"text": "Set it up — open what you need, clear one spot on your desk.", "secs": 30},
               {"text": "Do just that tiny step now. Only two minutes.", "secs": 120}],
     "finish": "You started — and starting is the hardest part. Be proud of that."},
    {"id": "brain_dump", "name": "Clear-Mind Brain Dump", "kind": "steps", "minutes": 3, "areas": ["A", "F", "B"], "calming": False,
     "intro": "Move the swirling thoughts out of your head and onto paper, so your mind can breathe.",
     "steps": [{"text": "Grab a page or your notes app.", "secs": 15},
               {"text": "Write down everything on your mind — no order, no judging.", "secs": 75},
               {"text": "Circle just one thing you can do something about today.", "secs": 25},
               {"text": "Let the rest rest. They are safe on the page.", "secs": 15}],
     "finish": "Lighter already. Your mind is clearer, and you know your one next step."},
    {"id": "kind_voice", "name": "The Kind-Voice Pause", "kind": "steps", "minutes": 2, "areas": ["E", "C"], "calming": True,
     "intro": "Speak to yourself the way you would speak to a friend you care about.",
     "steps": [{"text": "Place a hand on your chest and take one slow breath.", "secs": 15},
               {"text": "Quietly name what feels hard right now — one honest sentence.", "secs": 25},
               {"text": "Remind yourself: lots of students feel this way. You are not alone.", "secs": 20},
               {"text": "Say one kind line to yourself: \"I'm doing my best, and that is enough for today.\"", "secs": 25}],
     "finish": "That kind voice is real, and it belongs to you. It gets stronger every time you use it."},
    {"id": "three_wins", "name": "Three Small Wins", "kind": "steps", "minutes": 2, "areas": ["E", "A"], "calming": False,
     "intro": "Your mind notices what is undone. Let's give the done things some light too.",
     "steps": [{"text": "Think of one thing you finished today, however small.", "secs": 25},
               {"text": "Think of one moment you handled better than you expected.", "secs": 25},
               {"text": "Think of one kind thing you did — for someone, or for yourself.", "secs": 25},
               {"text": "Read your three wins back. They are proof of who you are.", "secs": 15}],
     "finish": "Three wins, all yours. You are doing more than you give yourself credit for."},
    {"id": "connection_ping", "name": "One Warm Message", "kind": "steps", "minutes": 2, "areas": ["D", "F"], "calming": False,
     "intro": "Connection doesn't have to be big. One short message can brighten two days at once.",
     "steps": [{"text": "Think of one person you feel easy around.", "secs": 20},
               {"text": "Remember one good moment with them.", "secs": 20},
               {"text": "Type a short message: \"Thought of you today — how are you?\"", "secs": 40},
               {"text": "Send it (or save it for later). Either way, you reached out.", "secs": 15}],
     "finish": "You just made the world a little warmer — including your own corner of it."},
    {"id": "worry_window", "name": "The Worry Window", "kind": "steps", "minutes": 3, "areas": ["F", "A", "C"], "calming": True,
     "intro": "Give your worries a small, safe window of time — so they don't follow you all day.",
     "steps": [{"text": "Name the worry in one short line.", "secs": 20},
               {"text": "Ask: is this in my hands today, later, or not at all?", "secs": 30},
               {"text": "If it's in your hands, pick one small action. If not, gently set it down.", "secs": 40},
               {"text": "Close the window: three slow breaths, and back to your day.", "secs": 25}],
     "finish": "You looked at the worry with courage. That's exactly how it shrinks to its real size."},
]
EX_BY_ID = {e["id"]: e for e in EXERCISES}

# ---------------------------------------------------------------- brain games
GAMES = [
    {"id": "sudoku", "name": "Mini Sudoku", "areas": ["A", "F"], "skill": "Focus & calm logic",
     "why": "A gentle puzzle that trains steady focus — one small square at a time, just like your studies."},
    {"id": "memory", "name": "Memory Match", "areas": ["B", "E", "C"], "skill": "Attention & memory",
     "why": "A light memory workout that pulls your attention away from busy thoughts and into the present."},
    {"id": "zerokata", "name": "Zero-Kata", "areas": ["D", "C"], "skill": "Playful strategy",
     "why": "A quick, playful game of thinking one move ahead — a little fun is good for the mind."},
]
GAME_BY_ID = {g["id"]: g for g in GAMES}

# ---------------------------------------------------------------- articles
_R = lambda id, area, tone, title, minutes, summary, body, tip: {
    "id": id, "area": area, "tone": tone, "title": title, "minutes": minutes, "summary": summary, "body": body, "try": tip}

ARTICLES = [
    # A — Academic & Workload
    _R("a1", "A", "calm", "When Everything Feels Due Tomorrow", 3,
       "A gentle way to quiet the pile-up feeling and find your next small step.",
       ["If your to-do list feels like a mountain, you are not lazy and you are not behind in life. Your brain is simply trying to hold too many things at once — and when it can't decide where to start, it freezes.",
        "The kindest thing you can do is make the list visible. Write every task down, then choose just three that matter most this week. Everything else can wait in the 'later' column without guilt.",
        "Then shrink the first task until it feels almost too easy: open the document, write the heading, read one page. Small starts build momentum, and momentum builds confidence.",
        "You have handled hard weeks before. This one is no different — one small, visible step at a time."],
       "Write your top three tasks on a sticky note and keep it where you can see it."),
    _R("a2", "A", "lift", "Progress Over Perfect", 2,
       "Why 'good enough today' beats 'perfect someday' — and how to feel proud along the way.",
       ["Perfectionism often looks like high standards, but it usually feels like pressure. It whispers that nothing counts until it's flawless, so we delay, re-do and doubt.",
        "Try a new rule this week: done is a draft, and drafts are allowed. A rough first version gives you something real to improve — a blank page doesn't.",
        "At the end of each study session, note one thing you moved forward, however small. Over days, these notes become a quiet record of your effort and growth.",
        "You are learning, and learning is meant to be a little messy. That's not failure — that's exactly how progress looks."],
       "Finish one task to 'good enough' today and let it go."),
    _R("a3", "A", "grow", "Study Smarter With Tiny Focus Sprints", 3,
       "Short bursts of focus with real breaks help you learn more and feel less drained.",
       ["Your attention works like a battery, not a tap. It runs best in short, focused bursts followed by real rest.",
        "Try a 25-minute sprint: phone in another room, one task only. When the timer ends, stand up, stretch, drink water, look out of a window for five minutes.",
        "After three or four sprints, take a longer break. You'll often find you got more done than in hours of distracted studying — and you'll feel lighter, too.",
        "Every sprint you finish is a small promise kept to yourself. That builds a kind of confidence no exam result can take away."],
       "Do one 25-minute focus sprint today, then take a proper 5-minute break."),
    # B — Body & Sleep
    _R("b1", "B", "calm", "A Gentle Wind-Down for Busy Minds", 3,
       "A simple evening routine that helps your body remember how to rest.",
       ["If your mind races at night, it's not a personal flaw — it's a busy day still echoing. Your body needs a little signal that the day is over.",
        "Choose a 'lights low' time about 30 minutes before bed. Dim the room, put your phone across the room and pick something calm: a warm shower, light stretching, a few pages of a book.",
        "If thoughts keep popping up, jot them on paper. You're not ignoring them — you're simply giving them a place to wait until morning.",
        "Rest is not a reward you earn. It's fuel you deserve, every single night."],
       "Put your phone across the room 30 minutes before bed tonight."),
    _R("b2", "B", "lift", "Your Wake-Up Time Is Your Superpower", 2,
       "The surprising sleep habit that resets your energy and mood.",
       ["Many students try to fix sleep by going to bed earlier. But the real reset button is the time you wake up.",
        "Waking at roughly the same time each day — even after a late night — helps your body clock settle. Within a week or two, falling asleep often becomes easier on its own.",
        "Step into daylight soon after waking, even for five minutes. Morning light tells your brain: 'the day has started' — which helps you feel sleepy at the right time later.",
        "Small, steady habits like this quietly lift your energy, focus and mood. You're building a body that supports you."],
       "Pick one wake-up time for the next three days and step outside within 30 minutes of waking."),
    _R("b3", "B", "grow", "Food, Water, Movement: The Quiet Mood Boosters", 3,
       "Three everyday basics that have a big effect on how you feel.",
       ["When life gets busy, the basics are the first to slip — skipped meals, too little water, long hours sitting still. Your mood feels it before you notice.",
        "Start small. Keep a water bottle on your desk. Add one proper meal you don't skip. Take a ten-minute walk between classes or study blocks.",
        "Movement doesn't have to be a workout. A walk, a dance to one song, or a few stretches all help your body release stress.",
        "Caring for your body is not a distraction from your goals — it's the foundation that makes them possible."],
       "Take a 10-minute walk today, ideally outdoors."),
    # C — Emotional Load & Coping
    _R("c1", "C", "calm", "Name It to Tame It", 2,
       "Why putting a single word to your feeling can make it feel smaller.",
       ["When emotions pile up, they can feel like one big heavy cloud. Naming them gently separates that cloud into pieces you can understand.",
        "Pause and ask: 'What am I feeling right now?' Maybe it's tired, worried, lonely or frustrated. Even one word helps your brain shift from reacting to understanding.",
        "There's no wrong answer, and no feeling is 'too much'. Feelings are messages, not verdicts about who you are.",
        "Each time you name a feeling, you're practising a skill that makes you calmer and stronger over time."],
       "Three times today, pause and name your feeling in one word."),
    _R("c2", "C", "lift", "Calm Your Body First, Your Thoughts Will Follow", 3,
       "When stress feels loud, start with your breath — not your thinking.",
       ["When we're stressed, we often try to think our way out. But a racing body keeps feeding racing thoughts.",
        "Try the opposite: start with your body. Slow your out-breath so it's longer than your in-breath. Drop your shoulders. Unclench your jaw. Feel your feet on the floor.",
        "Within a minute or two, your nervous system starts to settle — and clearer thoughts have room to come back.",
        "You always carry this tool with you. Wherever you are, a few slow breaths can be your way back to calm."],
       "Before your next task, take five breaths with a long, slow exhale."),
    _R("c3", "C", "grow", "Building Your Personal Calm Toolkit", 3,
       "Create a short list of things that genuinely help you feel better.",
       ["Everyone has things that help them feel steady — a song, a walk, a call with a friend, a cup of tea, a quiet corner. The trick is remembering them when stress hits.",
        "Make a small 'calm toolkit' list on your phone. Add five things that take less than ten minutes and reliably lift you, even a little.",
        "Next time you feel overwhelmed, open the list and pick one. No thinking, no deciding — just one kind action.",
        "Knowing what helps you is a quiet kind of strength. It means you can take care of yourself, again and again."],
       "Write down five quick things that help you feel better and save the list."),
    # D — Social & Belonging
    _R("d1", "D", "calm", "Feeling Alone in a Crowd Is More Common Than You Think", 3,
       "Loneliness at university is normal — and there are gentle ways through it.",
       ["Campuses are full of people, and still many students quietly feel alone. If that's you, you are in very good company — far more than it seems.",
        "Loneliness isn't about the number of friends you have. It's about feeling seen. And that can start with just one person and one honest sentence.",
        "Try small, low-pressure steps: sit near the same classmates each week, join one club meeting, say yes to one invite.",
        "Connection grows slowly, like a plant. Every small hello is water. You are worth knowing, and the right people will see that."],
       "Say a friendly hello or send one warm message to someone today."),
    _R("d2", "D", "lift", "Healing After a Hard Goodbye", 3,
       "Gentle reminders for when a friendship or relationship has ended.",
       ["When a relationship ends, the hurt is real — even if others don't see it. Grief after a goodbye is not weakness; it's a sign that you cared.",
        "Give yourself permission to feel it, without rushing. Keep simple routines going: meals, sleep, classes, a little movement.",
        "Lean on people who feel safe. You don't need to explain everything — 'I'm having a hard week' is enough.",
        "Healing isn't a straight line. Some days will feel lighter than others. Every one of them is moving you forward."],
       "Tell one trusted person: 'I'm having a hard week.'"),
    _R("d3", "D", "grow", "Small Ways to Build Real Belonging", 2,
       "Belonging is built in tiny, repeated moments. Here's how to create them.",
       ["Belonging rarely arrives in one big moment. It builds through small, repeated ones — the same study group, the same table at lunch, the same friendly faces.",
        "Choose one place you go regularly and show up there consistently. Familiarity is the first step towards friendship.",
        "Be curious about others. Ask a simple question, remember a detail, follow up next time. People feel valued when they're remembered.",
        "You bring something unique to every space you enter. Belonging begins when you let others see a little of it."],
       "Ask a classmate one curious question today and really listen."),
    # E — Identity & Self-worth
    _R("e1", "E", "calm", "Quieting the Inner Critic", 3,
       "How to answer that harsh inner voice with kindness and truth.",
       ["Most of us carry an inner critic — the voice that says we're not doing enough or not good enough. It often thinks it's helping, but it mostly drains our energy.",
        "When you hear it, pause and ask: 'Would I say this to a friend?' If not, try rewriting the thought in a fair, kind way.",
        "'I'm terrible at this' can become 'I'm still learning this, and that's okay.' Not fake positivity — just the fuller truth.",
        "You deserve the same patience and warmth you so easily give to others. Start offering it to yourself."],
       "Catch one harsh thought today and rewrite it the way a good friend would."),
    _R("e2", "E", "lift", "Your Path Is Allowed to Look Different", 2,
       "Comparison steals joy. Here's how to come back to your own journey.",
       ["Social feeds show everyone's highlight reel. It's easy to compare your behind-the-scenes with someone else's best moments — and feel like you're falling behind.",
        "But there is no single timeline for life. People find their path at different speeds, in different orders, and that's perfectly normal.",
        "When comparison creeps in, gently ask: 'What matters to me?' Then take one small step towards that.",
        "Your journey is yours alone, and it is unfolding exactly as it needs to. Trust yourself a little more today."],
       "Take a 24-hour break from the feed that makes you compare most."),
    _R("e3", "E", "grow", "Collect Proof of Your Strengths", 3,
       "A simple nightly habit that slowly rebuilds self-belief.",
       ["Our minds remember mistakes far more easily than successes. Over time, this paints a picture of ourselves that is unfairly dim.",
        "Each night, write down three things you did that day — tasks completed, kind moments, small courage. Keep them in one place.",
        "On a hard day, read back through your list. It becomes real evidence of your effort, strengths and growth.",
        "Self-belief isn't something you're born with. It's something you build, one honest note at a time — and you've already begun."],
       "Tonight, write down three things you did well today."),
    # F — Family, Money & Future
    _R("f1", "F", "calm", "When the Future Feels Too Big", 3,
       "Bringing big worries about career and life back to a size you can handle.",
       ["Thinking about the future can feel like staring at a huge, foggy road. Career, money, family hopes — it can all feel like too much at once.",
        "You don't need the whole map today. You only need the next few metres. What is one small thing you could learn, ask or explore this week?",
        "Talk to a senior, visit the careers cell, or read about one path that interests you. Information turns fog into shapes you can work with.",
        "Many successful people didn't have it figured out at your age. Curiosity and steady steps will take you further than certainty ever could."],
       "Write down one question about your future and one person who could help answer it."),
    _R("f2", "F", "lift", "Starting the Conversation at Home", 3,
       "A gentle way to talk with family about money, plans or pressure.",
       ["Some conversations feel too big to start — especially about money, expectations or a change of plans. So we avoid them, and the worry keeps looping.",
        "Try planning a short, calm talk. Choose a relaxed time, start with appreciation, then share one honest point: 'I've been thinking about…'",
        "You don't have to solve everything in one go. The goal is simply to open the door. Most families want to understand, even if it takes time.",
        "Speaking honestly takes courage — and you have more of it than you realise."],
       "Write the first sentence you'd use to start one important family conversation."),
    _R("f3", "F", "grow", "Small Money Habits, Big Peace of Mind", 2,
       "Easy student-friendly steps to feel calmer and more in control of money.",
       ["Money worries often feel heavier when they're vague. Getting a little clarity can bring surprising calm.",
        "Spend five minutes noting what came in and what went out this week. No judging — just noticing.",
        "Pick one tiny habit: a weekly spending limit, a small savings jar, or checking your balance every Sunday.",
        "Feeling in control doesn't require a lot of money. It comes from knowing where you stand — and that's a skill you can build today."],
       "Spend 5 minutes writing down this week's spending."),
]
ART_BY_ID = {a["id"]: a for a in ARTICLES}

# ---------------------------------------------------------------- nudges
MOOD_NUDGE = {
    0: ("Be extra gentle with yourself today", "Today feels heavy, and that's okay. You don't have to fix everything — just take one small, kind step for yourself. If it feels like too much, reaching out is a sign of strength."),
    1: ("One small step is enough", "Rough days happen to everyone. Slow down, breathe, and choose just one easy thing to do well. You are doing better than you think."),
    2: ("Mixed days still count", "Some parts of today may feel good and some not so much — that's perfectly normal. Notice one thing that went right and let it carry you forward."),
    3: ("You're finding your rhythm", "You're feeling steady — that's something you've built. Keep going with the small habits that are helping you."),
    4: ("Let this good energy grow", "You're feeling strong today. Celebrate it! Use this energy for one thing that matters to you, and remember this feeling on harder days."),
}
NEUTRAL_NUDGE = ("A fresh day, a fresh start", "However yesterday went, today is a new page. Take a breath, be kind to yourself, and begin with one small step.")

AREA_NUDGE = {
    "A": "For your studies: pick one tiny task and give it just ten focused minutes.",
    "B": "For your energy: a glass of water and a short walk in daylight can work wonders.",
    "C": "For your calm: three slow breaths whenever things start to feel loud.",
    "D": "For connection: one warm hello or message can brighten your whole day.",
    "E": "For self-belief: notice one thing you did well today — it counts.",
    "F": "For the road ahead: you don't need every answer today, only the next step.",
}

AREA_NAMES = {"A": "Academic & Workload", "B": "Body & Sleep", "C": "Emotional Load & Coping",
              "D": "Social & Belonging", "E": "Identity & Self-worth", "F": "Family, Money & Future"}
DEFAULT_PRI = ["C", "B", "A"]


def _lib(report, programme=None):
    """Wellness library for the report's programme: its own (FocusEdge) or the shared EquiMind one."""
    import programmes
    W = getattr(programmes.get((report or {}).get("programme") or programme), "WELLNESS", None)
    if W:
        return {**W, "own": True}
    return {"EXERCISES": EXERCISES, "GAMES": GAMES, "ARTICLES": ARTICLES, "AREA_NUDGE": AREA_NUDGE, "MOOD_NUDGE": MOOD_NUDGE,
            "AREA_NAMES": AREA_NAMES, "DEFAULT_PRI": DEFAULT_PRI, "own": False}


def _ctx(report, L=None):
    """Return (day_index, mood_or_None, priorities) for the student."""
    L = L or _lib(report)
    default = L["DEFAULT_PRI"]
    today = datetime.now(timezone.utc)
    if not report:
        return int(today.timestamp() // 86400), None, default
    elapsed = (today - datetime.fromisoformat(report["created_at"])).days
    mood = (report.get("moods") or {}).get(str(min(max(elapsed, 0), 13)))
    pri = report.get("priorities") or default
    if not L["own"] and report.get("programme") in ("mindmellow", "mindedge"):  # map school-programme areas onto the shared libraries' areas
        import programmes
        WELLNESS_MAP = programmes.get(report["programme"]).WELLNESS_MAP
        pri = list(dict.fromkeys(WELLNESS_MAP[k] for k in pri)) + [k for k in DEFAULT_PRI if k not in {WELLNESS_MAP[x] for x in pri}]
    return max(elapsed, 0), mood, pri


def _tone_for(mood):
    return "calm" if mood is not None and mood <= 1 else "lift" if mood == 2 else "grow" if mood is not None else None


def pick_exercise(pri, mood, day, exercises=EXERCISES):
    def score(e):
        s = sum(w for k, w in zip(pri, (3, 2, 1)) if k in e["areas"])
        if mood is not None and mood <= 1 and e["calming"]:
            s += 3
        if mood is not None and mood >= 3 and not e["calming"]:
            s += 1
        return s
    pool = [e for e in exercises if e["calming"]] if mood is not None and mood <= 1 else exercises
    ranked = sorted(pool, key=lambda e: -score(e))
    top = ranked[:3]
    return top[day % len(top)]


def pick_game(pri, day, disabled=(), games=GAMES):
    area = pri[day % len(pri)]
    pool = [g for g in games if g["id"] not in disabled]
    if not pool:
        return None, area
    g = next((g for g in pool if area in g["areas"]), pool[0])
    return g, area


def _articles(report, L=None):
    import programmes
    L = L or _lib(report)
    skip = () if L["own"] else getattr(programmes.get((report or {}).get("programme")), "SKIP_READS", ())
    return [a for a in L["ARTICLES"] if a["id"] not in skip]


def pick_reads(pri, mood, day, arts=ARTICLES):
    tone = _tone_for(mood)
    out = []
    for i, area in enumerate(pri[:3]):
        pool = [a for a in arts if a["area"] == area]
        if not pool:
            continue
        if i == 0 and tone:
            pool.sort(key=lambda a: a["tone"] != tone)
            out.append(pool[0])
        else:
            out.append(pool[(day + i) % len(pool)])
    return out


def _ex_why(e, pri, mood, personalised=True, names=AREA_NAMES):
    if not personalised:
        return "A gentle favourite to help you feel calm and clear — your check-in will make this even more personal."
    area = next((k for k in pri if k in e["areas"]), pri[0])
    if mood is not None and mood <= 1:
        return f"Chosen because today feels {MOODS[mood].lower()} — a calming practice to help you feel steadier."
    return f"Chosen for your {names[area]} focus from your check-in."


def today_plan(report, disabled_games=(), programme=None):
    L = _lib(report, programme)
    names = L["AREA_NAMES"]
    day, mood, pri = _ctx(report, L)
    ex = pick_exercise(pri, mood, day, L["EXERCISES"])
    game, garea = pick_game(pri, day, disabled_games, L["GAMES"])
    reads = pick_reads(pri, mood, day, _articles(report, L))
    title, text = L["MOOD_NUDGE"][mood] if mood is not None else NEUTRAL_NUDGE
    return {
        "personalised": bool(report),
        "mood": mood, "mood_label": MOODS[mood] if mood is not None else None,
        "focus_areas": [{"key": k, "name": names[k]} for k in pri[:3]],
        "exercise": {**ex, "why": _ex_why(ex, pri, mood, bool(report), names)},
        "game": {**game, "tag": "Hustle for Your Brain", "for_area": names[garea]} if game else None,
        "nudge": {"title": title, "text": text, "area_tip": L["AREA_NUDGE"][pri[0]]},
        "reads": [{**a, "area_name": names[a["area"]]} for a in reads],
    }


def all_reads(report, programme=None):
    L = _lib(report, programme)
    _, mood, pri = _ctx(report, L)
    order = {k: i for i, k in enumerate(pri)}
    rows = sorted(_articles(report, L), key=lambda a: (order.get(a["area"], 99), a["id"]))
    return [{**a, "area_name": L["AREA_NAMES"][a["area"]], "for_you": a["area"] in pri[:3]} for a in rows]


def student_games(programme):
    """Ordered game ids students of this programme can play (FocusEdge has its own focus-themed set)."""
    return [g["id"] for g in _lib({"programme": programme})["GAMES"]]
