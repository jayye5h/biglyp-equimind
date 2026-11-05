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

## Backlog
- P1: Counsellor role with consent-based report sharing; Institution admin with cohort filters
- P1: Admin editing of items/activities (content governance)
- P2: Real login (email/Google), Day-30 reminder emails, item-level Day-30 comparison view
