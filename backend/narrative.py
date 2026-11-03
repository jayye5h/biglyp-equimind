import os
import json
import re
import uuid
import asyncio
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
from content import AREA_BY_KEY, LOOP_FRAGMENTS, AREA_PHRASES

logger = logging.getLogger(__name__)

FORBIDDEN = re.compile(r"diagnos|depress|adhd|disorder|suicid|self-harm|anxiety disorder|you have |you are suffering|mental illness|bipolar|ptsd", re.I)

SYSTEM = """You write one short section of a student wellbeing self-reflection report (EquiMind by Biglyp) for Indian university students.
Strict rules:
- Use only the facts given (scores and the student's own high-frequency statements). Never invent events, history, causes or symptoms.
- Tentative phrasing only: 'Your responses suggest...', 'You may be...', 'It sounds like...'. Never 'you have' or 'you are'.
- Never name or imply any medical or psychological condition, and never mention risk or probability.
- Warm, plain, second-person student language. No clinical words. No advice lists.
Return ONLY valid JSON with keys:
"honest_line": one sentence (max 28 words) starting lowercase, summarising where the biggest pressure sits,
"narrative": one paragraph, 70-110 words, starting with the student's first name and a comma,
"loop": array of exactly 4 short phrases (max 4 words each) forming a stress cycle grounded in the statements,
"loop_note": one sentence starting with '...and' explaining how it feeds back, ending with which link is easiest to change first."""


def fallback(first_name: str, result: dict) -> dict:
    p = result["priorities"]
    names = [AREA_BY_KEY[k]["short"] for k in p]
    alone = "D" in p
    honest = f"your {names[0].lower()} and {names[1].lower()} areas are taking the biggest hit right now" + (", and you may have been carrying it mostly alone." if alone else ".")
    narrative = (f"{first_name}, from the 24 questions you answered, a picture comes through. Your responses suggest that "
                 f"{AREA_PHRASES[p[0]]}, that {AREA_PHRASES[p[1]]}, and that {AREA_PHRASES[p[2]]}. "
                 "None of this is a verdict on you — it is a map of where the pressure sits over the last two weeks, "
                 "and where small, doable actions may help most first.")
    loop = [LOOP_FRAGMENTS[k] for k in p] + ["Less energy to cope"]
    note = f"...and having less energy to cope feeds back into the start. {AREA_BY_KEY[p[0]]['short']} is often the easiest link to change first."
    return {"honest_line": honest, "narrative": narrative, "loop": loop, "loop_note": note, "source": "template"}


def _valid(d: dict) -> bool:
    if not isinstance(d, dict):
        return False
    if not all(isinstance(d.get(k), str) and d[k].strip() for k in ("honest_line", "narrative", "loop_note")):
        return False
    if not (isinstance(d.get("loop"), list) and len(d["loop"]) == 4 and all(isinstance(x, str) for x in d["loop"])):
        return False
    blob = " ".join([d["honest_line"], d["narrative"], d["loop_note"], *d["loop"]])
    return not FORBIDDEN.search(blob)


async def _generate(first_name: str, result: dict) -> str:
    areas = "; ".join(f"{a['name']}: {a['score']}/100 ({a['level']})" for a in result["areas"])
    pri = ", ".join(AREA_BY_KEY[k]["name"] for k in result["priorities"])
    items = "\n".join(f"- {t}" for t in result["high_items"]) or "- (none rated Often or Almost always)"
    prompt = (f"Student first name: {first_name}\nArea scores (higher = less stress): {areas}\nOverall: {result['overall']}/100\n"
              f"Three priority areas: {pri}\nStatements the student said happen Often or Almost always:\n{items}\n\nWrite the JSON now.")
    chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"narr-{uuid.uuid4()}",
                   system_message=SYSTEM).with_model("anthropic", "claude-sonnet-5-5")
    out = []
    async for ev in chat.stream_message(UserMessage(text=prompt)):
        if isinstance(ev, TextDelta):
            out.append(ev.content)
        elif isinstance(ev, StreamDone):
            break
    return "".join(out)


async def write_narrative(first_name: str, result: dict) -> dict:
    try:
        text = await asyncio.wait_for(_generate(first_name, result), timeout=75)
        m = re.search(r"\{.*\}", text, re.S)
        data = json.loads(m.group(0)) if m else None
        if _valid(data):
            return {"honest_line": data["honest_line"].strip(), "narrative": data["narrative"].strip(),
                    "loop": [x.strip() for x in data["loop"]], "loop_note": data["loop_note"].strip(), "source": "ai"}
        logger.warning("Narrative failed guardrails, using template")
    except Exception as exc:
        logger.error("Narrative generation error: %s", exc)
    return fallback(first_name, result)
