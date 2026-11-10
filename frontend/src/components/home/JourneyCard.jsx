import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, ClipboardCheck } from "lucide-react";
import { Student } from "@/components/Avatar";
import { BANDS } from "@/components/report/PlanTrack";
import { elapsedDays } from "@/lib/progress";
import { stageAt, projectedStage, STAGES, phaseOf } from "@/lib/stages";

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

const dayInfo = (r, d, today) => {
  const mood = (r.moods || {})[d];
  const done = r.plan.filter((_, i) => (r.ticks || []).includes(`${i}-${d}`)).length;
  if (d > today) return { future: true, stage: projectedStage(r, d), label: "Upcoming", done };
  const stage = stageAt(r, d);
  if (BANDS[mood]) return { stage, label: SHORT[mood], mood, done };
  if (done) return { stage, label: `${done}/5 done`, done };
  return { stage, label: d === today ? "Today" : "Not logged", done };
};

const SideCard = ({ r, d, today, side }) => {
  if (d < 0 || d > 13) return <div className="hidden md:block" />;
  const info = dayInfo(r, d, today);
  return (
    <div data-testid={`journey-side-${side}`} className="hidden md:flex flex-col items-center justify-center rounded-3xl bg-white/70 border border-eq/10 p-4 text-center">
      <span className="rounded-full bg-eq-soft text-eq-dark text-xs font-semibold px-3 py-1">Day {d + 1}</span>
      <Student stage={info.stage} dim={info.future} size="h-24 w-24" testid={`journey-side-avatar-${side}`} />
      <div className="mt-2 text-sm text-slate-700">{info.future ? (d === today + 1 ? "Tomorrow is going to be better!" : "Keep going to unlock") : STAGES[info.stage - 1].caption}</div>
    </div>
  );
};

const MainCard = ({ r, d, today, onSave, pending, onOpenDaily }) => {
  const info = dayInfo(r, d, today);
  const moods = r.moods || {};
  const isToday = d === today && today <= 13;
  return (
    <div data-testid="journey-main-card" className="rounded-3xl bg-white border-2 border-eq/20 shadow-[0_20px_60px_-30px_rgb(var(--eq-p)/0.5)] p-5 sm:p-6">
      <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
        <div className="text-center">
          <Student stage={info.stage} dim={info.future} size="h-36 w-36 sm:h-40 sm:w-40" testid="journey-main-avatar" bounce={false} />
          <p data-testid="journey-main-stage" className="mt-2 text-xs font-medium text-eq-dark max-w-[11rem] mx-auto">{STAGES[info.stage - 1].caption}</p>
        </div>
        <div className="sm:border-l sm:border-slate-100 sm:pl-5">
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-eq-soft text-eq-dark text-xs font-semibold px-3 py-1">Day {d + 1}</span><span data-testid="journey-main-phase" className="rounded-full bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1">Phase {phaseOf(info.stage).n}: {phaseOf(info.stage).name}</span></div>
          <h3 data-testid="journey-main-title" className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-slate-900">{info.mood !== undefined ? TITLES[info.mood] : isToday ? "How are you today?" : info.future ? "Coming up" : "No mood logged"}</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{info.mood !== undefined ? DESC[info.mood] : isToday ? "One tap to log your mood — your journey card updates instantly." : info.future ? "Keep going with your plan — this day is waiting for you." : "You didn't log a mood this day. That's fine — today is what counts."}</p>
          <p data-testid="journey-main-progress" className="mt-3 text-xs font-mono text-slate-500">{info.done}/5 plan activities done</p>
        </div>
      </div>
      {isToday && (
        <div className="mt-5 flex flex-wrap gap-2" data-testid="journey-mood-buttons">
          {BANDS.map((b) => (
            <button key={b.v} data-testid={`journey-mood-${b.v}`} onClick={() => onSave({ moods: { ...moods, [d]: b.v } })}
              className={`h-9 px-3.5 rounded-full text-sm border transition-colors ${moods[d] === b.v ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
              style={moods[d] === b.v ? { background: b.c } : {}}>{b.l}</button>
          ))}
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {pending !== null && <button data-testid="journey-log-yesterday-btn" onClick={onOpenDaily} className="h-10 px-4 rounded-xl bg-eq text-white text-sm font-medium inline-flex items-center gap-2 hover:bg-eq-dark transition-colors"><ClipboardCheck className="h-4 w-4" /> Log Day {pending + 1} activities</button>}
      </div>
      <div className="mt-5 rounded-2xl bg-eq-bg px-4 py-3 flex items-center gap-2 text-sm italic text-eq-dark"><Quote className="h-4 w-4 shrink-0" />{QUOTES[d % QUOTES.length]}</div>
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
              <Student stage={info.stage} dim={info.future} size="h-9 w-9" testid={`journey-day-avatar-${d}`} />
              <span className="mt-1 text-xs font-semibold text-slate-800">Day {d + 1}</span>
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
  return (
    <section data-testid="journey-card" className="rounded-[2rem] bg-gradient-to-b from-white to-eq-bg border border-eq/10 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Your 14-Day Wellness Journey</h2>
        <span data-testid="journey-day-badge" className="rounded-full bg-eq-soft text-eq-dark font-semibold text-sm px-4 py-1.5 whitespace-nowrap">{e > 13 ? "Journey complete" : `Day ${today + 1} of 14`}</span>
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
