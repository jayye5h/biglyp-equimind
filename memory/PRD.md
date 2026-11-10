# EquiMind — PRD

## Original problem statement
"This is the document with the product details of equimind. Also attached are screenshots of few page design for reference. Develop the Equimind platform for university undergraduates and post graduates."
(Attachments: Biglyp_EquiMind_DesignDoc_v10.pdf, Biglyp_EquiMind_Vibrant_Report.pdf, Mindly + Luma screenshots)

User choices: mocked login (3 students + admin), Student role, AI-written narrative within safe wording, PDF download, calm mint look (Luma).

## Architecture
- FastAPI + MongoDB backend: content.py (180-item bank, 6 areas × 4 sub-themes, activity library, theory), scoring.py (stratified pick, scoring, levels, priorities, path, body trigger, 14-day plan), narrative.py (Claude claude-sonnet-5-5 via Emergent LLM key, guardrail regex, template fallback), server.py (routes, demo auth via bearer session tokens).
- React frontend: Landing, Login (demo cards), Dashboard, Assessment, ReportView (11 sections + PDF via html2canvas/jsPDF), Admin (overview/question bank/activities).

## User personas
- UG/PG student in India doing a private stress check-in
- Platform admin viewing content and anonymous cohort numbers

## Core requirements (static)
- 24 items (one per sub-theme), 0-4 scale, two-week recall
- Area score = round(100 − raw/16×100); overall = mean; bands <35/35-49/50-64/65+
- 3 lowest = priorities; Path 2 if any area <35 or overall <45
- Retake: Day 28-35 = same items; <7 days = exclude previous items; else fresh
- Body page trigger; Tele-MANAS 14416 safety floor everywhere; non-diagnostic wording; private by default

## Implemented (2026-11-03)
- Full MVP above; tested by testing agent (backend 17/17, frontend all flows); fixed radar responsiveness, submit race, progress validation, resources rule, per-student admin stats

## Implemented (2026-11-03, iteration 2)
- Colour theme switched to light blue by default; mint green kept as an option via a two-swatch toggle (landing header, login, app header). Saved per browser (localStorage `eq_theme`). Theme colours are CSS variables (`--eq-*`) mapped to Tailwind `eq` colours; charts read hex values from `useTheme().palette`; PDF background follows the active theme.

## Implemented (2026-11-05, iteration 3)
- Report highlight pages (Cover, About, stress-loop chips, Get-help box) now use a blue tone instead of navy + yellow. 5 selectable tones at top of report: Powder, Cornflower, Azure (default), Cobalt, Midnight; saved per browser (`eq_feature_tone`); applied to PDF export too. Tones via CSS vars `--ft-*` (lib/featureTones.js).

## Implemented (2026-11-05, iteration 4)
- Dashboard (below Past check-ins / Overall trend) now shows: 14-Day Plan summary (day x/14, ticks, per-activity progress) and Track & Reflect summary (mood strip, tracker & reflection counts) — each links to /report/:id#plan or #track; then full "Who Can Help & When to Ask" section (shared HelpContent component).

## Implemented (2026-11-05, iteration 5)
- Daily Mood Tap on dashboard: "How are you feeling today?" with 5 mood bands; one tap saves today's mood (day index = days since report, Days 1-14) to the latest report's mood strip via PATCH progress; hidden after Day 14.

## Implemented (2026-11-05, iteration 6)
- Mood Week View on dashboard: 7-day bar chart (height + colour by mood band) with Week 1 / Week 2 tabs, days-logged count and "mostly <mood>" summary; today highlighted.

## Implemented (2026-11-05, iteration 7)
- PDF export pages now size to their content (210 mm wide, height varies per section) — no blank space on short pages.

## Implemented (2026-11-09, iteration 8)
- Report-writing wait screen shows 20 rotating zen statements/mini exercises (random start, changes every 6 s, never repeats back-to-back).

## Implemented (2026-11-09, iteration 9)
- PDF excludes 14-Day Plan & Track pages. Week 1 Progress page (stats + template write-up) unlocks at Day 7; 14-Day Trend page (W1 vs W2 table + inferences + next step) at Day 14 — both in-app and PDF (lib/progress.js, ProgressPages.jsx).
- Dashboard daily check-in popup (>=24h after report, once per day, `logged_days`): 5 animated activity questions with SVG student (sleeping scene for wake-up, animated props), mood meter improves on Yes, dips on No; saves ticks.
- Track & Reflect: explainer of the weekly tracker objective, clearer rows/columns with hints, auto rows from plan ticks.
- Backend validates tick format and dedupes logged_days.

## Implemented (2026-11-10, iteration 10)
- Student dashboard redesigned (pages/StudentHome.jsx, components/home/*): sidebar (Home, Daily Check-in, My Journey, Insights, Toolkit, Support; mobile pill nav), bell with pending dot, profile menu.
- 14-Day Wellness Journey card: prev/current/next day cards with animated student, mood title/description, today's one-tap mood, activities done, log-yesterday button, quote; 5-day strip with arrows.
- Calm Shorts, Audiobooks, Videos: curated free YouTube videos (seeded in `media` collection, played in an in-app youtube-nocookie player); admin Media tab to add/edit/delete links.
- Activity of the Day: playable Sudoku (4×4, rule-based check), Zero-Kata (tic-tac-toe vs computer), Memory Match.

## Implemented (2026-11-10, iteration 11)
- Daily activity log pop-up redesigned per "Daily Activity Log.pdf": 6 steps — (1) Good to see you again + Glow meter + today's mood (5 faces), (2-6) one step per plan activity with tailored heading/subtitle, question, Yes / Not this time, Back / Next, 1/5 dots; 60-second check-in step also captures stress (0-10) and one feeling (`daily_notes`); final "Submit today's check-in" (components/DailyLog.jsx).
- New illustrated student avatar (headphones + hoodie) in 5 mood expressions (public/avatars/mood0-4.webp, AI-generated) used in popup and journey cards (components/Avatar.jsx).

## Implemented (2026-11-10, iteration 12)
- Personalised daily wellness (backend/wellness.py; GET /api/wellness/today, /api/wellness/reads): picks a guided exercise from 11 (breath or step-by-step, only calming ones on Struggling/Rough days), a brain game tagged "Hustle for Your Brain", 3 Wellness Reads (18-article built-in library, 3 per area, matched to priorities + today's mood) and a daily mental nudge (mood + weakest area).
- Home order: Journey → Calm Streak → Activity of the Day (exactly 2 cards) → Calm Shorts → Wellness Reads + Audiobooks (Videos removed). Toolkit: activity, all 3 Brain Games, shorts, all reads (Picked for you / More to explore), audiobooks.
- Calm Streak: 14 named day badges (logged_days), current/best streak, warm messages, toast on new badge; also on My Journey tab. Exercise player (components/home/ExercisePlayer.jsx) with animated breath circle and timed steps.

## Backlog
- P1: Counsellor role with consent-based report sharing; Institution admin with cohort filters
- P1: Admin editing of items/activities (content governance)
- P2: Real login (email/Google), Day-30 reminder emails, item-level Day-30 comparison view
