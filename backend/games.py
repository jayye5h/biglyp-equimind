"""Games library: 26 short mood-lifting games (3 live for students + 23 admin-preview), tagged by area & mood,
with an admin on/off switch stored in `game_settings` ({id, enabled})."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

# moods: 0 Struggling · 1 Rough · 2 Mixed · 3 Steady · 4 Strong (same labels as wellness.MOODS)  (which daily moods a game suits)
CALM, FOCUS, LIFT, PLAY = "Calm", "Focus", "Mood lift", "Playful"
ALL = [0, 1, 2, 3, 4]
LOW = [0, 1, 2]
UP = [2, 3, 4]

GAMES = [
    # ---- live for students today
    {"id": "sudoku", "name": "Mini Sudoku", "type": FOCUS, "areas": ["A", "F"], "moods": UP, "minutes": 3, "student": True,
     "skill": "Focus & calm logic", "how": "Fill the 4×4 grid so every row, column and box has 1–4.",
     "why": "A gentle puzzle that trains steady focus — one small square at a time, just like your studies."},
    {"id": "memory", "name": "Memory Match", "type": FOCUS, "areas": ["B", "E", "C"], "moods": ALL, "minutes": 2, "student": True,
     "skill": "Attention & memory", "how": "Flip two cards at a time and find all six pairs.",
     "why": "A light memory workout that pulls attention away from busy thoughts and into the present."},
    {"id": "zerokata", "name": "Zero-Kata", "type": PLAY, "areas": ["D", "C"], "moods": UP, "minutes": 2, "student": True,
     "skill": "Playful strategy", "how": "Classic noughts and crosses against the computer.",
     "why": "A quick, playful game of thinking one move ahead — a little fun is good for the mind."},
    # ---- admin preview library
    {"id": "bubble-pop", "name": "Bubble Pop", "type": CALM, "areas": ["C", "B"], "moods": ALL, "minutes": 1,
     "skill": "Release & reset", "how": "Pop the floating bubbles. There's no timer and no way to lose.",
     "why": "Small, satisfying taps let built-up tension go without needing to think."},
    {"id": "breath-balloon", "name": "Breath Balloon", "type": CALM, "areas": ["C", "B"], "moods": LOW, "minutes": 2,
     "skill": "Slow breathing", "how": "Hold the button to breathe in and fill the balloon, then let go to breathe out. Five slow breaths.",
     "why": "Longer out-breaths tell the body it is safe, which settles a racing mind."},
    {"id": "gratitude-jar", "name": "Gratitude Jar", "type": LIFT, "areas": ["E", "D"], "moods": ALL, "minutes": 2,
     "skill": "Noticing the good", "how": "Drop three small good things from today into the jar.",
     "why": "Naming good moments, however small, gently trains the mind to spot them more often."},
    {"id": "odd-colour", "name": "Odd Colour Out", "type": FOCUS, "areas": ["A"], "moods": UP, "minutes": 1,
     "skill": "Visual attention", "how": "Tap the one tile whose shade is slightly different. It gets harder each round.",
     "why": "A calm attention drill that rests the thinking mind while sharpening the eyes."},
    {"id": "word-scramble", "name": "Kind Word Scramble", "type": LIFT, "areas": ["E", "A"], "moods": UP, "minutes": 2,
     "skill": "Positive focus", "how": "Unscramble the letters to find an uplifting word.",
     "why": "Spending a minute with words like 'hope' and 'brave' quietly colours your mood."},
    {"id": "simon", "name": "Echo Pattern", "type": FOCUS, "areas": ["A", "C"], "moods": UP, "minutes": 2,
     "skill": "Working memory", "how": "Watch the pads light up, then repeat the pattern. It grows by one each round.",
     "why": "Holding a short pattern in mind builds focus and pushes worries to the side."},
    {"id": "worry-clouds", "name": "Worry Clouds", "type": LIFT, "areas": ["C", "F"], "moods": LOW, "minutes": 1,
     "skill": "Letting go", "how": "Tap each grey worry cloud to clear it and let the sun come through.",
     "why": "A playful picture of how worries pass — they are weather, not the whole sky."},
    {"id": "kindness-cards", "name": "Kindness Cards", "type": LIFT, "areas": ["E", "D"], "moods": ALL, "minutes": 1,
     "skill": "Self-kindness", "how": "Flip a card to reveal a kind message, and keep the ones you like.",
     "why": "Hearing a kind sentence, even from yourself, softens harsh self-talk."},
    {"id": "slide-puzzle", "name": "Slide Puzzle", "type": FOCUS, "areas": ["A", "F"], "moods": UP, "minutes": 3,
     "skill": "Patient problem-solving", "how": "Slide the tiles into order from 1 to 8.",
     "why": "Small moves add up to a solved puzzle, just like steady progress on a big task."},
    {"id": "reaction-tap", "name": "Green Light Tap", "type": PLAY, "areas": ["B", "D"], "moods": UP, "minutes": 1,
     "skill": "Alertness", "how": "Wait for the circle to turn green, then tap as fast as you can.",
     "why": "A quick burst of play that wakes the body up on a sluggish day."},
    {"id": "quick-sums", "name": "Quick Sums", "type": FOCUS, "areas": ["A"], "moods": UP, "minutes": 1,
     "skill": "Mental warm-up", "how": "Answer as many easy sums as you can in 30 seconds.",
     "why": "A light warm-up that switches the brain into 'study mode' before you begin."},
    {"id": "word-search", "name": "Calm Word Search", "type": FOCUS, "areas": ["C", "A"], "moods": ALL, "minutes": 3,
     "skill": "Slow focus", "how": "Find the five calm words hidden in the grid. Tap the first and last letter of each word.",
     "why": "Slow, careful searching settles the mind into one simple thing at a time."},
    {"id": "lights-out", "name": "Lights Out", "type": FOCUS, "areas": ["A", "F"], "moods": UP, "minutes": 3,
     "skill": "Logical thinking", "how": "Each tap flips a light and its neighbours. Turn every light off.",
     "why": "A gentle logic puzzle that rewards trying, noticing and adjusting."},
    {"id": "catch-stars", "name": "Catch the Stars", "type": PLAY, "areas": ["D", "E"], "moods": UP, "minutes": 1,
     "skill": "Playful energy", "how": "Tap the star before it moves. Catch ten.",
     "why": "Light, quick play brings a small spark of fun into the day."},
    {"id": "affirmation", "name": "Affirmation Builder", "type": LIFT, "areas": ["E"], "moods": ALL, "minutes": 1,
     "skill": "Self-belief", "how": "Pick a start, a middle and an end to build a sentence that feels true for you.",
     "why": "Choosing your own words makes an affirmation feel honest rather than forced."},
    {"id": "zen-sand", "name": "Zen Sand", "type": CALM, "areas": ["C", "B"], "moods": LOW, "minutes": 2,
     "skill": "Mindful drawing", "how": "Draw slow lines in the sand. They fade gently on their own.",
     "why": "Slow, aimless movement soothes the nervous system with nothing to get right."},
    {"id": "guess-word", "name": "Guess the Word", "type": PLAY, "areas": ["D", "A"], "moods": UP, "minutes": 2,
     "skill": "Playful thinking", "how": "Guess the hidden uplifting word one letter at a time. You have six misses.",
     "why": "A light word game that lifts the mood and gets the brain gently working."},
    {"id": "grounding", "name": "5-4-3-2-1 Grounding", "type": CALM, "areas": ["C", "B"], "moods": [0, 1], "minutes": 2,
     "skill": "Grounding", "how": "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell and 1 you taste.",
     "why": "Moving attention to the senses pulls the mind out of a worry loop and back to now."},
    {"id": "steady-beat", "name": "Steady Beat", "type": CALM, "areas": ["B", "C"], "moods": LOW, "minutes": 1,
     "skill": "Rhythm & calm", "how": "Tap in time with the slow pulse for eight beats.",
     "why": "A slow, steady rhythm helps the heart and breath settle."},
    {"id": "pattern-recall", "name": "Pattern Recall", "type": FOCUS, "areas": ["A", "E"], "moods": UP, "minutes": 2,
     "skill": "Visual memory", "how": "Remember which squares light up, then tap them back.",
     "why": "A short memory challenge that brings full attention to the present."},
    {"id": "higher-lower", "name": "Higher or Lower", "type": PLAY, "areas": ["F", "D"], "moods": UP, "minutes": 1,
     "skill": "Easy-going play", "how": "Will the next card be higher or lower? Build a streak.",
     "why": "Low-stakes guessing is a reminder that uncertainty can also be fun."},
    {"id": "rps", "name": "Rock Paper Scissors", "type": PLAY, "areas": ["D"], "moods": UP, "minutes": 1,
     "skill": "Quick fun", "how": "Play first to three wins against the computer.",
     "why": "A familiar game that brings a quick smile and a small break."},
    {"id": "count-shapes", "name": "Count the Shapes", "type": FOCUS, "areas": ["A", "B"], "moods": ALL, "minutes": 1,
     "skill": "Mindful counting", "how": "Count how many of one shape are in the picture and choose the right number.",
     "why": "Counting slowly is a simple anchor that quiets mental noise."},
]
GAME_BY_ID = {g["id"]: g for g in GAMES}
assert len(GAMES) == 26


class GameToggle(BaseModel):
    enabled: bool


async def disabled_ids(db):
    return {d["id"] async for d in db.game_settings.find({"enabled": False}, {"_id": 0, "id": 1})}


def build_router(db, admin_user, current_user):
    r = APIRouter()

    @r.get("/admin/games")
    async def list_games(_: dict = Depends(admin_user)):
        off = await disabled_ids(db)
        return [{**g, "enabled": g["id"] not in off} for g in GAMES]

    @r.patch("/admin/games/{gid}")
    async def toggle_game(gid: str, body: GameToggle, _: dict = Depends(admin_user)):
        if gid not in GAME_BY_ID:
            raise HTTPException(404, "Game not found")
        await db.game_settings.update_one({"id": gid}, {"$set": {"id": gid, "enabled": body.enabled}}, upsert=True)
        return {"id": gid, "enabled": body.enabled}

    @r.get("/games/enabled")
    async def enabled_student_games(user: dict = Depends(current_user)):
        import wellness
        off = await disabled_ids(db)
        if user.get("programme") == "focusedge":  # FocusEdge students get their own focus-themed game set
            return [g for g in wellness.student_games("focusedge") if g not in off]
        return [g["id"] for g in GAMES if g.get("student") and g["id"] not in off]

    return r
