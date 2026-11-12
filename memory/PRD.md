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

## Implemented (2026-11-10, iteration 13)
- Progress avatars: user-supplied 14 growth-stage images (public/avatars/stages/stage1-14.webp, cropped from Avatar.png) replace the old mood avatars everywhere (journey card, day strip, daily log popup, streak badges). Stage = 1 + number of daily check-ins (lib/stages.js), never goes back; future days show projected stage dimmed. 4 phases (1-3, 4-8, 9-12, 13-14) shown as phase chip on journey card and phase pills above streak badges; streak card shows "stage X/14"; toast "New stage unlocked".

## Implemented (2026-11-10, iteration 14)
- Dashboard header: "New Assessment" (renamed) + "Open 14-day plan" (moved out of journey card). My Journey: single combined "Your 14-Day Plan" progress section (DashboardActions.PlanProgress).
- Report: Plan + Track & Reflect merged into one theory-only "Your 14-Day Plan" section (activity time/when, "Why it helps" from backend/plan_theory.py WHY, steps); now included in PDF. Day 7+: Week 1 Progress; Day 14+: Week 2 Progress (days 8-14 vs week 1) + Your Next Steps (recommends same 5 / focus on 3 / take up new activities via lib/progress.nextStepsPlan; new activities from GET report `next_activities`).

## Implemented (2026-11-11, iteration 15)
- Report illustrations (public/report-art/*.webp, PageShell `art` prop): snapshot = current stage avatar; narrative, per-area priority art, plan, week 1/2, next steps, help, body. Cover & About have none. About privacy text: counsellors can review/monitor and act in severe cases.
- Web push reminders (VAPID, pywebpush; backend/push_notify.py, public/sw.js, lib/push.js, home Reminders card). Platform crons (.emergent/crons.yml) 10:00/16:00/20:00 IST → POST /api/cron/reminders (bearer WEBHOOK_CRON_SECRET) → push + in-app notification record to students whose today's check-in is pending.
- Daily check-in feedback step (helpful / feel / comment) saved to report.feedback[day]; shown on journey day card and counsellor record.
- Counsellor role (cou-kavya, Dr. Kavya Menon) — backend/counselling.py: slots (seeded, soft-remove), student bookings (slot) or requests, counsellor portal /counsellor (Sessions & requests, Needs attention flags, All students, My availability) and /counsellor/student/:uid (flags, scores, progress, daily record table, bookings + private notes); counsellor can open any report.

## Implemented (2026-11-11, iteration 16)
- Report pages 2-6 restructured to user mockups (app + PDF): PageShell `inline` (accent underline, no motif), `side`/`headExtra`; Snapshot (art + radar | tiles, icon area cards, purple honest line), Narrative (art left/text right), Priority 1 (art beside title), Priority 2/3 (art left, score + why right). Art cropped from mockups (snapshot, narrative, area_a/c/f) + generated matching area_b/d/e. Pages 7-10 mockups pending from user.
- Report pages 7-10 restructured to user mockups (app + PDF): Plan (header art, two-column activity cards with unique illustrated icons via planIcons), Week 1/2 (icon tiles, art + bars, writeup with clipboard art), Help (header art, illustrated tier cards, chat-icon scripts), Body (header art, icon table + chips, illustrated bottom boxes). Art cropped from mockups with transparent bg.

## Backlog
- P1: Counsellor role with consent-based report sharing; Institution admin with cohort filters
- P1: Admin editing of items/activities (content governance)
- P2: Real login (email/Google), Day-30 reminder emails, item-level Day-30 comparison view

## 2026-11-11 (iteration 16) — environment restore + demo data
- Recreated backend/frontend .env (new VAPID keys, cron secret), installed deps. Fresh DB seeded: real AI reports for 3 students via API, then `python backend/scripts/seed_demo_progress.py` (Ananya 8 days, Rohan 14 days, Meera 5 low days + booking). Seed ticks "once this fortnight" activities only once.
- Known gap (not fixed, awaiting user): progress.js treats one-off activities as daily (counts toward full days / "hardest" / "slipped").

## 2026-11-11 (iteration 17)
- Report Week 2 + Your Next Steps restyled to user mockups (art cropped from mockups → public/report-art/week2_hero, week2_clip, next_head, next_same/three/new, next_study .webp); web + PDF.
- Admin Games library (backend/games.py: 26 games = 3 student-live + 23 admin-preview, tagged type/area/mood; `game_settings` on/off; GET/PATCH /api/admin/games, GET /api/games/enabled). Frontend: components/games/pack/* (23 new games), games/registry.js, admin/GamesLibrary.jsx (filters, play dialog, toggles). Disabled student games are skipped in wellness pick + Toolkit.

## 2026-11-12 (iteration 18) — Notification module
- backend/notify.py: 7 notifications (checkin_reminder, session_booked, session_cancelled, session_reminder, week1_unlocked, week2_unlocked, low_mood_alert) x 3 channels (email=Resend BYOK — RESEND_API_KEY/RESEND_FROM not set yet → "not_connected"; sms=DEMO log only; app=in-app inbox + web push). Admin switches in `notification_settings`; every attempt in `notification_log`. Routes: /api/admin/notifications (GET, PUT /{id}, POST /{id}/test, GET /log), /api/me/contact (GET/PUT), /api/notifications/read-all, /api/cron/notify-sweep (every 15 min: 1h session reminders + week unlocks).
- Hooks: push_notify reminders, counselling book/cancel/update, report progress moods → low-mood alert.
- Frontend: admin Notifications tab, header bell inbox (NotificationBell), ContactDialog (profile menu / header icon). Sample contacts seeded for demo users.

## 2026-11-12 (iteration 19) — Relax and Unwind
- Student Home (below Activity of the Day) + Toolkit: `components/home/RelaxUnwind.jsx` + `lib/sounds.js` — 15 looping ambient sounds ported from github.com/sid-talesara/mindmelo (MIT; audio hosted on audio.jukehost.co.uk, info videos on YouTube). Mix several, per-sound volume, Stop all, info dialog with YouTube embed. Added react-icons.

## 2026-11-12 (iteration 20)
- Relax and Unwind: sea-shore background; 15 sounds now local at frontend/public/sounds/<id>.mp3 (6-min 96kbps clips cut from jukehost originals, ~62MB total — originals were 1.2GB).
- Product Document: backend/product_doc.py builds markdown live from content/scoring/games/notify modules → GET /api/admin/product-doc (admin). Page /admin/product-doc (ProductDoc.jsx, react-markdown + remark-gfm, TOC, Save as PDF via print, .md download); link card on Admin page. Static snapshot at docs/EquiMind_Product_Document.md.
