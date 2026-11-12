import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, ClipboardCheck, MessageCircleHeart, Lock, Check, X, Sparkles } from "lucide-react";
import { HELPFUL_L, FEEL_L, FEEL_TONE } from "@/lib/feedback";
import { Student } from "@/components/Avatar";
import { BANDS } from "@/components/report/PlanTrack";
import { elapsedDays } from "@/lib/progress";
import { stageAt, currentStage, doneUpTo, toNextStage, PER_STAGE, STAGES, phaseOf } from "@/lib/stages";

const TITLES = ["Taking It Slow", "Hanging In There", "Finding Your Feet", "Feeling More Calm", "Feeling Bright"];
const SHORT = ["Struggling", "Rough day", "Settling", "Calmer", "More Open"];
const DESC = [
  "Today feels heavy. That's okay — one small step from your plan is enough.",
  "A tough day, and you're still showing up. Be gentle with yourself.",
  "Things are settling. Small habits are starting to hold you steady.",
  "You feel less stressed, a bit more focused, and more open to connecting with others.",
  "You're feeling strong today. Notice what helped, so you can repeat it.",
];
const QUOTES = [
  "Small, consistent steps quietly create a happier you.",
  "Progress, not perfection.",
  "Rest is part of the work.",
  "You don't have to do it all today.",
  "One honest sentence can lighten the load.",
  "Your pace is still progress.",
  "Tomorrow is the restart, not next Monday.",
];

const doneOn = (r, d) => r.plan.map((_, i) => (r.ticks || []).includes(`${i}-${d}`));

const dayInfo = (r, d, today) => {
  const mood = (r.moods || {})[d];
  const marks = doneOn(r, d);
  const done = marks.filter(Boolean).length;
  const logged = (r.logged_days || []).includes(d);
  if (d > today) return { future: true, stage: null, label: "Locked", done: 0, marks, logged: false };
  const stage = stageAt(r, d);
  const prev = d > 0 ? stageAt(r, d - 1) : 1;
  const base = { stage, grew: stage > prev, mood, done, marks, logged };
  if (logged) return { ...base, label: `${done}/${r.plan.length} done` };
  if (BANDS[mood]) return { ...base, label: SHORT[mood] };
  return { ...base, label: d === today ? "Today" : "Not logged" };
};

/** Future days are locked: no avatar preview until the student actually gets there. */
const Locked = ({ size, testid }) => (
  <div data-testid={testid} data-locked="true" className={`relative mx-auto ${size} rounded-full bg-slate-100 ring-1 ring-slate-200 grid place-items-center`}>
    <Lock className="h-1/3 w-1/3 text-slate-300" strokeWidth={1.8} />
  </div>
);

const Avatar = ({ info, size, testid, bounce }) => info.future ? <Locked size={size} testid={testid} /> : <Student stage={info.stage} size={size} testid={testid} bounce={bounce} />;

const SideCard = ({ r, d, today, side }) => {
  if (d < 0 || d > 13) return <div className="hidden md:block" />;
  const info = dayInfo(r, d, today);
  return (
    <div data-testid={`journey-side-${side}`} className={`hidden md:flex flex-col items-center justify-center rounded-3xl border border-eq/10 p-4 text-center ${info.future ? "bg-slate-50/80" : "bg-white/70"}`}>
      <span className={`rounded-full text-xs font-semibold px-3 py-1 ${info.future ? "bg-slate-100 text-slate-400" : "bg-eq-soft text-eq-dark"}`}>Day {d + 1}</span>
      <div className="mt-3"><Avatar info={info} size="h-24 w-24" testid={`journey-side-avatar-${side}`} /></div>
      <div className="mt-2 text-sm text-slate-600">{info.future ? (d === today + 1 ? "Unlocks tomorrow" : "Locked") : info.logged ? `${info.done} of ${r.plan.length} activities done` : d === today ? "Not logged yet" : "Not logged"}</div>
    </div>
  );
};

const titleFor = (info, isToday) => {
  if (info.future) return "Locked";
  if (info.mood !== undefined && info.mood !== null && BANDS[info.mood]) return TITLES[info.mood];
  if (info.logged) return info.done >= 4 ? "A Strong Day" : info.done >= 2 ? "Small Steps Taken" : info.done === 1 ? "One Step Forward" : "Checked In";
  return isToday ? "How are you today?" : "Not logged";
};

const descFor = (info, isToday, total, d, start) => {
  if (info.future) {
    const on = new Date(new Date(start).getTime() + d * 864e5).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    return `This day unlocks on ${on}. Your avatar grows only with the activities you complete — it can't skip ahead.`;
  }
  const mood = info.mood !== undefined && info.mood !== null && BANDS[info.mood] ? `${DESC[info.mood]} ` : "";
  if (info.logged) {
    if (!info.done) return `${mood}You checked in but no plan activities were done this day — your avatar stayed where it was. That's okay, the next one counts.`;
    return `${mood}You completed ${info.done} of ${total} plan activities${info.grew ? " — and your avatar grew to a new stage!" : "."}`;
  }
  if (isToday) return `${mood}Log today's check-in — every activity you complete moves your avatar closer to its next stage.`;
  return "No check-in this day, so your avatar stayed where it was. Today is what counts.";
};

const MainCard = ({ r, d, today, onSave, pending, onOpenDaily }) => {
  const info = dayInfo(r, d, today);
  const moods = r.moods || {};
  const isToday = d === today && elapsedDays(r) <= 13;
  return (
    <div data-testid="journey-main-card" data-state={info.future ? "locked" : info.logged ? "logged" : "open"} className={`rounded-3xl border-2 p-5 sm:p-6 ${info.future ? "bg-slate-50 border-slate-200" : "bg-white border-eq/20 shadow-[0_20px_60px_-30px_rgb(var(--eq-p)/0.5)]"}`}>
      <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
        <div className="text-center">
          <Avatar info={info} size="h-36 w-36 sm:h-40 sm:w-40" testid="journey-main-avatar" bounce={false} />
          <p data-testid="journey-main-stage" className={`mt-2 text-xs font-medium max-w-[11rem] mx-auto ${info.future ? "text-slate-400" : "text-eq-dark"}`}>{info.future ? "Not unlocked yet" : `Stage ${info.stage} · ${STAGES[info.stage - 1].caption}`}</p>
        </div>
        <div className="sm:border-l sm:border-slate-100 sm:pl-5">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full text-xs font-semibold px-3 py-1 ${info.future ? "bg-slate-100 text-slate-500" : "bg-eq-soft text-eq-dark"}`}>Day {d + 1}{isToday ? " · Today" : ""}</span>
            {!info.future && <span data-testid="journey-main-phase" className="rounded-full bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1">Phase {phaseOf(info.stage).n}: {phaseOf(info.stage).name}</span>}
            {info.grew && <span data-testid="journey-main-grew" className="rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> New stage</span>}
          </div>
          <h3 data-testid="journey-main-title" className={`mt-3 font-serif text-2xl sm:text-3xl font-bold ${info.future ? "text-slate-400" : "text-slate-900"}`}>{titleFor(info, isToday)}</h3>
          <p data-testid="journey-main-desc" className="mt-2 text-sm text-slate-600 leading-relaxed">{descFor(info, isToday, r.plan.length, d, r.created_at)}</p>
          {!info.future && (info.logged || info.done > 0) && (
            <ul data-testid="journey-main-activities" className="mt-3 flex flex-wrap gap-1.5">
              {r.plan.map((a, i) => (
                <li key={a.id} data-testid={`journey-activity-${i}`} data-done={info.marks[i]} className={`rounded-full px-2.5 py-1 text-[11px] font-medium inline-flex items-center gap-1 ${info.marks[i] ? "bg-eq-soft text-eq-dark" : "bg-slate-100 text-slate-400 line-through"}`}>
                  {info.marks[i] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{a.short}
                </li>
              ))}
            </ul>
          )}
          {!info.future && <p data-testid="journey-main-progress" className="mt-3 text-xs font-mono text-slate-500">{info.logged || info.done ? `${info.done}/${r.plan.length} plan activities done` : "No activities logged yet"}</p>}
          {(r.feedback || {})[d] && (
            <div data-testid="journey-main-feedback" className="mt-3 rounded-2xl bg-eq-bg/70 border border-eq/10 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700 inline-flex items-center gap-1"><MessageCircleHeart className="h-3.5 w-3.5 text-eq" /> Your feedback</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-slate-700">{HELPFUL_L[r.feedback[d].helpful]}</span>
                <span className={`rounded-full px-2.5 py-0.5 ${FEEL_TONE[r.feedback[d].feel] || ""}`}>{FEEL_L[r.feedback[d].feel]}</span>
              </div>
              {r.feedback[d].comment && <p className="mt-1.5 text-sm italic text-slate-600">&ldquo;{r.feedback[d].comment}&rdquo;</p>}
            </div>
          )}
        </div>
      </div>
      {isToday && (
        <div className="mt-5 flex flex-wrap gap-2" data-testid="journey-mood-buttons">
          {BANDS.map((b) => (
            <button key={b.v} data-testid={`journey-mood-${b.v}`} onClick={() => onSave({ moods: { ...moods, [d]: b.v } })}
              className={`h-9 px-3.5 rounded-full text-sm border transition-colors ${moods[d] === b.v ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
              style={moods[d] === b.v ? { background: b.c, color: b.v === 4 ? "#fff" : "#1e293b" } : {}}>{b.l}</button>
          ))}
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {pending !== null && isToday && <button data-testid="journey-log-yesterday-btn" onClick={onOpenDaily} className="h-10 px-4 rounded-xl bg-eq text-white text-sm font-medium inline-flex items-center gap-2 hover:bg-eq-dark transition-colors"><ClipboardCheck className="h-4 w-4" /> Log Day {pending + 1} activities</button>}
      </div>
      {!info.future && <div className="mt-5 rounded-2xl bg-eq-bg px-4 py-3 flex items-center gap-2 text-sm italic text-eq-dark"><Quote className="h-4 w-4 shrink-0" />{QUOTES[d % QUOTES.length]}</div>}
    </div>
  );
};

const DayStrip = ({ r, sel, setSel, today }) => {
  const start = Math.max(0, Math.min(sel - 2, 9));
  const days = Array.from({ length: 5 }, (_, i) => start + i);
  return (
    <div className="mt-5 rounded-3xl bg-white/80 border border-eq/10 p-3 flex items-center gap-2">
      <button data-testid="journey-prev-btn" disabled={sel === 0} onClick={() => setSel(sel - 1)} className="h-9 w-9 shrink-0 rounded-full bg-white shadow-sm grid place-items-center disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
      <div className="flex-1 grid grid-cols-5 gap-1">
        {days.map((d) => {
          const info = dayInfo(r, d, today);
          return (
            <button key={d} data-testid={`journey-day-${d}`} onClick={() => setSel(d)}
              className={`rounded-2xl py-2 px-1 flex flex-col items-center transition-colors ${sel === d ? "bg-eq-soft ring-2 ring-eq" : "hover:bg-eq-bg"}`}>
              <Avatar info={info} size="h-9 w-9" testid={`journey-day-avatar-${d}`} />
              <span className={`mt-1 text-xs font-semibold ${info.future ? "text-slate-400" : "text-slate-800"}`}>Day {d + 1}</span>
              <span className="hidden sm:block text-[10px] text-slate-500 truncate max-w-full">{info.label}</span>
            </button>
          );
        })}
      </div>
      <button data-testid="journey-next-btn" disabled={sel === 13} onClick={() => setSel(sel + 1)} className="h-9 w-9 shrink-0 rounded-full bg-white shadow-sm grid place-items-center disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );
};

export const JourneyCard = ({ r, onSave, pending, onOpenDaily }) => {
  const e = elapsedDays(r);
  const today = Math.min(e, 13);
  const [sel, setSel] = useState(today);
  const logged = (r.logged_days || []).length;
  const done = doneUpTo(r);
  const stage = currentStage(r);
  const need = toNextStage(r);
  const focus = r.programme === "focusedge";
  const sub = !logged && !done
    ? "Your journey starts with today's check-in. Every activity you complete helps your avatar grow."
    : `${logged} of 14 days logged · ${done} ${done === 1 ? "activity" : "activities"} done · Stage ${stage} of 14`;
  return (
    <section data-testid="journey-card" className="rounded-[2rem] bg-gradient-to-b from-white to-eq-bg border border-eq/10 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 data-testid="journey-title" className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">{e > 13 ? `Your 14-Day ${focus ? "Focus" : "Wellness"} Journey — complete` : `Your 14-Day ${focus ? "Focus" : "Wellness"} Journey`}</h2>
          <p data-testid="journey-summary" className="mt-1 text-sm text-slate-600">{sub}</p>
        </div>
        <span data-testid="journey-day-badge" className="rounded-full bg-eq-soft text-eq-dark font-semibold text-sm px-4 py-1.5 whitespace-nowrap">{e > 13 ? "Journey complete" : `Day ${today + 1} of 14`}</span>
      </div>
      <div data-testid="journey-stage-progress" className="mt-4 flex items-center gap-3 text-xs text-slate-600">
        <div className="flex-1 h-2 rounded-full bg-white border border-eq/10 overflow-hidden"><div className="h-full bg-eq rounded-full transition-all duration-500" style={{ width: `${stage >= 14 ? 100 : ((done % PER_STAGE) / PER_STAGE) * 100}%` }} /></div>
        <span data-testid="journey-next-stage" className="whitespace-nowrap">{stage >= 14 ? "Final stage reached" : `${need} more ${need === 1 ? "activity" : "activities"} to reach Stage ${stage + 1}`}</span>
      </div>
      <div className="mt-6 grid md:grid-cols-[1fr_2.6fr_1fr] gap-4">
        <SideCard r={r} d={sel - 1} today={today} side="prev" />
        <MainCard r={r} d={sel} today={today} onSave={onSave} pending={pending} onOpenDaily={onOpenDaily} />
        <SideCard r={r} d={sel + 1} today={today} side="next" />
      </div>
      <DayStrip r={r} sel={sel} setSel={setSel} today={today} />
    </section>
  );
};
