"""EquiMind Product Document — generated live from the platform's own content and rules (single source of truth),
so the document always matches what the app actually does. Served to admins at GET /api/admin/product-doc."""
from datetime import datetime, timezone

import content as EQ
import games as G
import notify as N
import plan_theory as PT
import wellness as W

MOOD_LABELS = W.MOODS
STAGES = [("Finding Calm", 1, 3), ("Feeling Happier & More Energetic", 4, 8), ("Connecting, Engaging & Enjoying", 9, 12), ("Confident, Social & Lively", 13, 14)]
SOUNDS = ["Guitar", "Birds", "Night", "Flute", "Train", "Study", "Code", "Meditation", "Singing Bowl", "Cafe", "Waves", "Campfire", "Rain", "Forest", "Thunderstorm"]


def _area(k):
    return EQ.AREA_BY_KEY[k]["name"]


def _areas(keys):
    return ", ".join(_area(k) for k in keys)


def build(P=EQ) -> str:
    L = []
    w = L.append
    n_items = len(P.ITEMS)
    n_acts = sum(len(v) for v in P.ACTIVITIES.values())
    today = datetime.now(timezone.utc).strftime("%d %B %Y")

    mm = P.PROGRAMME != "equimind"
    w(f"# {P.NAME} — Product Document")
    w(f"*By Biglyp · Student stress & wellbeing platform for {P.AUDIENCE} · Generated {today} from the live platform*")
    w("")
    w("## Contents")
    for i, t in enumerate(["Product overview", "Users & roles", "Theoretical framework", "The assessment", "Question bank",
                           "Scoring & decision rules", "AI-written narrative", "Report structure", "The 14-day plan & daily check-in",
                           "Activity library", "Student dashboard", "Counsellor portal", "Admin dashboard", "Games library",
                           "Notifications", "Safety, privacy & ethics", "Technology & integrations", "Appendix"], 1):
        w(f"{i}. {t}")

    # 1
    w("\n## 1. Product overview")
    w(f"{P.NAME} is a private, non-diagnostic stress check-in and habit-building platform for {P.AUDIENCE}. "
      f"A student answers **24 short statements** (drawn from a bank of **{n_items}**) about the last two weeks. It scores six life areas, "
      "writes a warm personal report, and turns the three areas under most pressure into a **14-day plan of five small daily activities**. "
      "A daily check-in, mood tracking, progress pages at Day 7 and Day 14, calming exercises, games, sounds and short reads keep the student engaged, "
      "while a school / campus counsellor can see who may need support and book sessions.")
    w("\n**Design principles**")
    for b in ["**Reflect, don't diagnose** — tentative, student-friendly language; no medical or psychological labels; no risk scores.",
              "**Small steps beat big plans** — every recommendation is a short, concrete activity with a reason it helps.",
              "**Private by default** — the report is the student's; counsellors see records only to offer support and act in severe cases.",
              "**Safety floor everywhere** — Tele-MANAS 14416 / 1800-891-4416 (24/7), 112 and campus health are always visible.",
              "**Warm and calm** — soft colours, illustrations, growth-stage avatars and encouraging copy."]:
        w(f"- {b}")

    # 2
    w("\n## 2. Users & roles")
    w("| Role | What they do |\n|---|---|")
    w("| Student | Takes the check-in, reads the report, follows the 14-day plan, logs daily moods/activities, uses the Toolkit, books counselling |")
    w("| Counsellor | Sees sessions & requests, a ‘Needs attention’ list, every student's record and progress; manages availability slots |")
    w("| Admin | Views cohort numbers, the question bank, activity library, media, games, notifications and this document |")
    w("\nDemo sign-in (no password): " + ", ".join(f"{u['name']} ({u['role']})" for u in P.DEMO_USERS) + (", Platform Admin (admin, shared with EquiMind)" if mm else "") + ".")
    if P.PROGRAMME == "mindedge":
        w("\nMindEdge has its own landing page and sign-in (/mindedge). It shares its school counselling team with MindMellow (school counsellors see both Grade 9-10 and Grade 11-12 students) and shares the engine, report format, games, sounds, videos and notifications with EquiMind; only the theory, stress areas, question bank, activities and scripts differ. "
          "It focuses on the six stressors of the 9-10 age window — academics & study habits, parents & family, peer pressure, self-esteem (puberty-linked), emotional regulation and digital / social-media stress — and deliberately leaves career, breakup and financial themes to MindMellow. Parents are the primary trusted-adult tier and Childline 1098 is added to the safety floor.")
    elif mm:
        w("\nMindMellow has its own landing page and sign-in (/mindmellow) and its own school counsellor. It shares the engine, report format, games, sounds, videos and notifications with EquiMind; only the theory, stress areas, question bank, activities and scripts differ. "
          "It keeps dedicated coverage for competitive-exam anxiety (JEE / NEET / CUET), career + financial worry, and breakup / close-relationship conflict.")

    # 3
    w("\n## 3. Theoretical framework")
    w(f"{P.NAME} models student stress across **six life areas**, each split into **four sub-themes** (24 in total). "
      "The report explains *why* each pressure feels the way it does, then offers activities that target the easiest link to change.")
    w("\n### 3.1 Six life areas and 24 sub-themes")
    w("| Area | Sub-themes |\n|---|---|")
    for a in P.AREAS:
        subs = [s for s in P.SUBTHEMES.values() if s["area"] == a["key"]]
        w(f"| **{a['key']} · {a['name']}** | " + "; ".join(f"{s['key']} {s['name']}" for s in subs) + " |")
    w("\n### 3.2 The theory behind each area (shown on the student's priority pages)")
    for a in P.AREAS:
        w(f"\n**{a['name']}** — {P.THEORY[a['key']]}")
    w("\n### 3.3 The stress loop")
    w("Stress is presented as a self-reinforcing cycle of four links (e.g. " + " → ".join(P.LOOP_FRAGMENTS[k] for k in "ABC") + " → Less energy to cope). "
      "The report names the student's loop from their own high-frequency answers and points to the link that is easiest to change first.")
    w("\n### 3.4 Why the activities work")
    w("Each activity is grounded in well-established behavioural principles — lowering the activation energy to start, protecting attention, "
      "anchoring the body clock, calming the body before the mind, naming emotions, sharing the load and collecting evidence of progress. "
      "The specific rationale for each activity appears in the Activity library (section 10).")
    w("\n### 3.5 Habit formation & growth stages")
    w("The plan runs for **14 days** with exactly **five activities a day**, ticked in a one-minute daily check-in. Progress is shown as a growing avatar "
      "with 14 illustrated stages (it never goes backwards) grouped into four phases:")
    w("| Phase | Days |\n|---|---|")
    for name, a, b in STAGES:
        w(f"| {name} | {a}–{b} |")
    w("\n### 3.6 Worth ruling out: the body")
    w("Some ‘stress’ is partly physical. When sleep, energy or emotional scores are low, the report suggests simple checks:")
    w("| Possible cause | Signs | Simple check |\n|---|---|---|")
    for r in P.BODY_TABLE:
        w(f"| {r['cause']} | {r['signs']} | {r['check']} |")

    # 4
    w("\n## 4. The assessment")
    w(f"- **Format:** 24 statements, one from each sub-theme, picked at random from the {n_items}-item bank and shuffled.")
    w("- **Recall window:** the last two weeks.")
    w("- **Answer scale:** " + ", ".join(f"{s['value']} = {s['label']}" for s in P.SCALE) + " (higher = more stress).")
    w("- **Retakes:** Day 28–35 after the last check-in → the *same* 24 statements (a true comparison); within 7 days → fresh statements that exclude the previous ones; otherwise a fresh random set.")
    w("- **While the report is written** the student sees 20 rotating calming statements and mini-exercises.")

    # 5
    w(f"\n## 5. Question bank ({n_items} statements)")
    w("Item IDs follow `<sub-theme>-<number>`. All statements are currently active.")
    for a in P.AREAS:
        w(f"\n### {a['key']} · {a['name']}")
        for s in [s for s in P.SUBTHEMES.values() if s["area"] == a["key"]]:
            items = [i for i in P.ITEMS.values() if i["subtheme"] == s["key"]]
            w(f"\n**{s['key']} — {s['name']}** ({len(items)} statements)\n")
            for i in items:
                w(f"- `{i['id']}` {i['text']}")

    # 6
    w("\n## 6. Scoring & decision rules")
    w("| Rule | Definition |\n|---|---|")
    rules = [
        ("Area score", "Each area has 4 statements (max raw 16). **Score = round(100 − raw ÷ 16 × 100)** — higher means less stress."),
        ("Overall score", "Average of the six area scores."),
        ("Levels", "< 35 **Needs care first** · 35–49 **Watch** · 50–64 **Steady** · 65+ **Strength**"),
        ("Priority areas", "The three lowest-scoring areas (ties broken by more ‘Often/Almost always’ answers). Each gets its own report page."),
        ("Strengths / resources", "Up to two of the highest remaining areas scoring 50+."),
        ("Support path", "**Path 2 (counsellor strongly suggested)** if any area < 35 or overall < 45; otherwise **Path 1** (self-help first, support available)."),
        ("Body page", f"Shown if {P.AREA_BY_KEY[P.BODY_AREA]['name']} < 50, {P.AREA_BY_KEY[P.EMO_AREA]['name']} < 55, 3+ fatigue statements answered Often/Almost always, or Path 2."),
        ("High statements", "Up to 8 statements answered Often/Almost always feed the narrative and stress loop."),
    ]
    for a, b in rules:
        w(f"| {a} | {b} |")

    # 7
    w("\n## 7. AI-written narrative")
    w("- **Model:** Anthropic Claude (claude-sonnet-5-5) via the Emergent universal LLM key.")
    w("- **Input:** first name, six area scores and levels, overall score, three priority areas and the student's own high-frequency statements — nothing else.")
    w("- **Output (JSON):** an *honest line* (≤ 28 words), a 70–110-word narrative, a four-link stress loop and a loop note.")
    w("- **Guardrails:** tentative phrasing only ('Your responses suggest…'); a blocklist rejects any diagnosis or condition words "
      "(e.g. diagnose, depression, disorder, ADHD, suicide); invalid or blocked output falls back to a safe template written from the same data.")

    # 8
    w("\n## 8. Report structure")
    w("The report is readable in the app and downloadable as a PDF (pages sized to their content). Colour tone is selectable (5 blue tones).")
    w("| # | Page | Shown when | What it contains |\n|---|---|---|---|")
    pages = [
        ("Cover", "Always", "Student name, programme, date, overall score"),
        ("Your Snapshot", "Always", "Radar chart of six areas, levels, current growth-stage avatar, strengths"),
        ("What You May Be Going Through", "Always", "AI honest line + narrative, the four-link stress loop"),
        ("Priority pages (×3)", "Always", "Area score & level, the theory for that area, two recommended activities"),
        ("Your 14-Day Plan", "Always", "Five daily activities with time, when to use, steps and ‘why it helps’"),
        ("Week 1 Progress", "From Day 7", "Activities done (of 35), best/hardest habit, full days, mood average, per-activity bars, write-up"),
        ("Week 2 Progress", "From Day 14", "Days 8–14 vs Week 1, per-activity bars, write-up and trend insights"),
        ("Your Next Steps", "From Day 14", "Three options (same 5 / focus on 3 / take up new) with one recommended, the next activity list, an ‘Also’ note"),
        ("Who Can Help & When to Ask", "Always", "Path-based counsellor suggestion, ready-to-copy scripts, urgent help box"),
        ("Worth Ruling Out: Your Body", "Body-page rule", "Common physical causes and simple checks"),
        ("About This Report & Declaration", "Always", "What the report is and isn't, privacy, safety contacts"),
    ]
    for i, (p, s, c) in enumerate(pages, 1):
        w(f"| {i} | {p} | {s} | {c} |")
    w("\n**Next Steps rule:** Week 2 ≥ 80% done and ≥ 4 full days → *Take up new activities*; Week 2 < 60% or < 3 full days → *Focus on 3 activities a day*; "
      "otherwise → *Continue with the same 5 habits*. If mood or progress is not moving, the note suggests booking (or bringing forward) a counsellor appointment.")
    w("\n**Ready-to-copy scripts:**")
    for s in P.SCRIPTS:
        w(f"- *{s['to']}:* “{s['text']}”")

    # 9
    w("\n## 9. The 14-day plan & daily check-in")
    names = lambda ids: ", ".join(P.act(i)["name"].lower() for i in ids)
    w(f"- **Plan construction:** {P.act(P.PLAN_START)['name']} → the first activity of each priority area → {P.act(P.PLAN_CHECKIN)['name']} → fillers ({names(P.PLAN_FILLERS)}) until there are five.")
    w("- **Daily check-in pop-up** (once a day, from 24 h after the report): greeting + glow meter + today's mood (5 faces) → one step per activity (Yes / Not this time) → stress rating & feeling → a short feedback step.")
    w("- **Moods:** " + " · ".join(f"{i} {m}" for i, m in enumerate(MOOD_LABELS)) + ".")
    w("- **Calm Streak:** 14 named day badges, current and best streak, warm messages.")
    w("- **Week stats:** activities done of 35, % done, full days (all five done), best and hardest habit, average mood.")

    # 10
    w(f"\n## 10. Activity library ({n_acts} activities)")
    for k, acts in P.ACTIVITIES.items():
        w(f"\n### {k} · {P.AREA_BY_KEY[k]['name']}")
        for a in acts:
            w(f"\n**{a['name']}** — *{a['time']}* · Best for: {a['when']}")
            for i, st in enumerate(a["steps"], 1):
                w(f"{i}. {st}")
            why = getattr(P, "WHY", PT.WHY).get(a["id"])
            if why:
                w(f"\n*Why it helps:* {why}")

    # 11
    w("\n## 11. Student dashboard")
    w("Navigation: **Home · Daily Check-in · My Journey · Insights · Toolkit · Support**, with a notification bell, profile menu (contact details, sign out) and theme toggle.")
    for b in [
        "**14-Day Wellness Journey** — previous/current/next day cards with the growth avatar, mood, activities done and a quote.",
        "**Activity of the Day** — one guided exercise + one brain game picked for the student's priority areas and today's mood (only calming exercises on Struggling/Rough days).",
        "**Relax and Unwind** — 15 looping soothing sounds that can be mixed, each with its own volume: " + ", ".join(SOUNDS) + ".",
        "**Calm Shorts & Audiobooks** — curated free videos played in an in-app player (managed by admins).",
        "**Wellness Reads** — three short articles picked for the priority areas, from a library of 18.",
        "**Insights / My Journey** — past check-ins, overall trend, mood week view, plan progress, streak.",
        "**Support** — book a counselling slot or send a request; cancel bookings; Who Can Help section.",
        "**Reminders** — browser push + in-app notifications for the daily check-in.",
    ]:
        w(f"- {b}")
    w("\n**Guided exercises**\n\n| Exercise | Type | Minutes | Areas | Calming |\n|---|---|---|---|---|")
    for e in W.EXERCISES:
        w(f"| {e['name']} | {'Breathing' if e['kind'] == 'breath' else 'Step-by-step'} | {e['minutes']} | {_areas(e['areas'])} | {'Yes' if e['calming'] else 'No'} |")
    w("\n**Wellness reads**\n\n| Area | Title | Minutes |\n|---|---|---|")
    for a in W.ARTICLES:
        w(f"| {_area(a['area'])} | {a['title']} | {a['minutes']} |")

    # 12
    w("\n## 12. Counsellor portal")
    for b in ["**Sessions & requests** — confirm, move or cancel bookings; turn requests into confirmed slots.",
              "**Needs attention** — students flagged by: Path 2; any area < 35; overall < 50; two or more areas on Watch; recent daily moods averaging Rough or lower.",
              "**All students** — scores, plan progress, moods and daily feedback for each student.",
              "**My availability** — add or remove time slots."]:
        w(f"- {b}")

    # 13
    w("\n## 13. Admin dashboard")
    w("Tabs: **Overview** (cohort numbers, per-student stats) · **Question bank** · **Activities** · **Media** (add/edit/delete video links) · "
      "**Games** (play, filter and switch games on/off) · **Notifications** (channel switches, test sends, delivery log) · link to **this Product Document**.")

    # 14
    w(f"\n## 14. Games library ({len(G.GAMES)} games)")
    w("Three games are live for students today; the rest can be previewed and tested by admins. Each game is tagged by type, life areas and the moods it suits.")
    w("\n| Game | Type | Minutes | Areas | Good on moods | Live for students | Why it helps |\n|---|---|---|---|---|---|---|")
    for g in G.GAMES:
        w(f"| {g['name']} | {g['type']} | {g['minutes']} | {_areas(g['areas'])} | {', '.join(MOOD_LABELS[m] for m in g['moods'])} | {'Yes' if g.get('student') else 'Admin preview'} | {g['why']} |")

    # 15
    w("\n## 15. Notifications")
    w("Every notification can be sent by **Email** (Resend), **SMS** (demo mode — logged, not sent) and **App** (in-app inbox + browser push). "
      "Admins switch each channel on or off per notification; every attempt is recorded in a delivery log. Users add their email and mobile number under Contact details.")
    w("\n| Notification | Audience | When |\n|---|---|---|")
    for e in N.EVENTS:
        w(f"| {e['name']} | {e['audience']} | {e['when']} |")

    # 16
    w("\n## 16. Safety, privacy & ethics")
    for b in ["Non-diagnostic by design: wording rules + AI blocklist + template fallback.",
              "Safety floor on the help page, report and About page: Tele-MANAS 14416 / 1800-891-4416 (24/7, toll-free, confidential), 112, campus health.",
              "Reports are private to the student; counsellors may review records to offer support and act in severe cases (stated on the About page).",
              "No ads or tracking; demo sign-in only in this build."]:
        w(f"- {b}")

    # 17
    w("\n## 17. Technology & integrations")
    w("| Layer | Choice |\n|---|---|")
    for a, b in [("Frontend", "React, Tailwind CSS, shadcn/ui, Recharts, html2canvas + jsPDF for PDF"),
                 ("Backend", "FastAPI (Python), MongoDB"),
                 ("AI", "Claude via Emergent universal LLM key (narrative)"),
                 ("Email", "Resend (your account; needs RESEND_API_KEY)"),
                 ("SMS", "Demo log (no provider yet)"),
                 ("Push", "Web Push (VAPID) + service worker"),
                 ("Scheduled jobs", "Check-in reminders 10:00 / 16:00 / 20:00 IST; notification sweep every 15 min (session reminders, Week 1/2 unlocks)"),
                 ("Media", "YouTube embeds; soothing sounds stored in the app (6-minute looping clips)")]:
        w(f"| {a} | {b} |")

    # 18
    w("\n## 18. Appendix — glossary")
    for a, b in [("Path 1 / Path 2", "Self-help first vs counsellor strongly suggested."),
                 ("Priority area", "One of the three lowest-scoring life areas."),
                 ("Full day", "A day on which all five plan activities were ticked."),
                 ("Growth stage", "One of 14 avatar illustrations; advances with each daily check-in."),
                 ("Stress loop", "Four linked pressures that feed each other, from the student's own answers.")]:
        w(f"- **{a}** — {b}")
    w(f"\n---\n*This document is generated from the live {P.NAME} content and rules, so it updates automatically when the platform changes.*")
    return "\n".join(L)
