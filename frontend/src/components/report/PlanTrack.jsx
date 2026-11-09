import { useState } from "react";
import { Check } from "lucide-react";
import { PageShell } from "@/components/report/PageShell";

export const PlanPage = ({ r, n, total, onSave }) => {
  const ticks = new Set(r.ticks || []);
  const toggle = (key) => {
    const next = new Set(ticks);
    next.has(key) ? next.delete(key) : next.add(key);
    onSave({ ticks: [...next] });
  };
  return (
    <PageShell n={n} total={total} eyebrow="Action · fill in as you go" title="Your 14-Day Starter Plan" id="plan" testid="report-page-plan">
      <p className="text-slate-600 -mt-2">Five tiny activities, under 30 minutes of new effort a day. Tick each one as you do it.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 min-w-[640px]" data-testid="plan-grid">
          <thead><tr><th className="text-left text-xs font-mono text-slate-400 font-normal pr-2">Activity</th>
            {Array.from({ length: 14 }, (_, d) => <th key={d} className="text-[10px] font-mono text-slate-400 font-normal">D{d + 1}</th>)}</tr></thead>
          <tbody>
            {r.plan.map((a, i) => (
              <tr key={a.id}>
                <td className="pr-3 py-1 text-sm font-medium text-slate-700 whitespace-nowrap"><span className="font-mono text-xs text-slate-400 mr-2">{i + 1}</span>{a.short}</td>
                {Array.from({ length: 14 }, (_, d) => {
                  const key = `${i}-${d}`;
                  const on = ticks.has(key);
                  return (
                    <td key={d}><button data-testid={`plan-tick-${i}-${d}`} onClick={() => toggle(key)} aria-pressed={on}
                      className={`h-8 w-full min-w-[28px] rounded-lg grid place-items-center transition-colors ${on ? "bg-eq text-white" : "bg-eq-bg hover:bg-eq-softer"}`}>{on && <Check className="h-4 w-4" />}</button></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p data-testid="plan-tick-count" className="mt-3 text-xs font-mono text-slate-500">{ticks.size} / 70 ticks</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-2xl bg-eq-soft p-5"><h4 className="font-semibold text-eq-dark">What counts as a good day</h4><ul className="mt-2 space-y-1.5 text-slate-700"><li>3 or more ticks.</li><li>1 or 2 ticks and you still showed up — count that too.</li><li>Zero ticks? Tomorrow is the restart, not next Monday.</li></ul></div>
        <div className="rounded-2xl bg-[#fef3c7] p-5"><h4 className="font-semibold text-[#92400e]">Minimum version</h4><p className="mt-2 text-slate-700">Just do activity 1 ({r.plan[0]?.short}) and activity 2 ({r.plan[1]?.short}). That still counts, and it protects everything else.</p></div>
        <div className="rounded-2xl bg-[#f3e8ff] p-5"><h4 className="font-semibold text-[#6d28d9]">Why so few</h4><p className="mt-2 text-slate-700">Because &apos;add 15 habits&apos; is how plans fail. These five are chosen so that even if you only do two, you&apos;re still working on your biggest areas.</p></div>
      </div>
    </PageShell>
  );
};

export const BANDS = [
  { v: 0, l: "Struggling", c: "#f07167" }, { v: 1, l: "Rough", c: "#fb923c" }, { v: 2, l: "Mixed", c: "#fbbf24" },
  { v: 3, l: "Steady", c: "rgb(var(--eq-mid))" }, { v: 4, l: "Strong", c: "rgb(var(--eq-p))" },
];
const ROWS = [
  { label: "How do I feel overall?", hint: "Score 1–10 (10 = great)" },
  { label: "Nights I slept well", hint: "Count out of 7" },
];
const COLS = [
  { label: "Day 1", hint: "Your starting point (the week before you began)" },
  { label: "Week 1", hint: "Fill on Day 7" },
  { label: "Week 2", hint: "Fill on Day 14" },
  { label: "Target", hint: "Where you'd like to be by Day 14" },
];
const QUESTIONS = ["What was one thing that helped this week?", "What was one thing that got in the way?", "What's one small change I'll try next week?"];

const MoodStrip = ({ r, onSave }) => {
  const elapsed = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5);
  const [day, setDay] = useState(Math.min(elapsed, 13));
  const moods = r.moods || {};
  return (
    <div className="rounded-2xl bg-eq-bg p-6">
      <h3 className="font-semibold text-slate-800">Mood strip — Day {day + 1}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {BANDS.map((b) => (
          <button key={b.v} data-testid={`mood-band-${b.v}`} onClick={() => onSave({ moods: { ...moods, [day]: b.v } })}
            className={`h-10 px-4 rounded-full text-sm border transition-colors ${moods[day] === b.v ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
            style={moods[day] === b.v ? { background: b.c } : {}}>{b.l}</button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-7 sm:grid-cols-14 gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
        {Array.from({ length: 14 }, (_, d) => (
          <button key={d} data-testid={`mood-day-${d}`} onClick={() => setDay(d)} title={`Day ${d + 1}`}
            className={`h-9 rounded-lg text-[10px] font-mono transition-shadow ${d === day ? "ring-2 ring-slate-800" : ""}`}
            style={{ background: BANDS[moods[d]] ? BANDS[moods[d]].c : "#ffffff", color: BANDS[moods[d]] ? "#fff" : "#475569" }}>{d + 1}</button>
        ))}
      </div>
    </div>
  );
};

export const TrackPage = ({ r, n, total, onSave }) => {
  const [tracker, setTracker] = useState(r.tracker || {});
  const [refl, setRefl] = useState(r.reflections || {});
  const ticks = new Set(r.ticks || []);
  const doneIn = (i, w) => Array.from({ length: 7 }, (_, d) => w * 7 + d).filter((d) => ticks.has(`${i}-${d}`)).length;
  return (
    <PageShell n={n} total={total} eyebrow="Action · fill in as you go" title="Track & Reflect" id="track" testid="report-page-track">
      <MoodStrip r={r} onSave={onSave} />
      <div data-testid="tracker-explainer" className="mt-6 rounded-2xl bg-[#fef3c7] p-5 text-sm text-slate-800">
        <h3 className="font-semibold text-[#92400e]">What is the weekly tracker for?</h3>
        <p className="mt-1.5">It answers one question: <b>is the plan actually helping?</b> You write down where you are on Day 1, check in again at the end of Week 1 and Week 2, and compare. If the numbers move towards your target, keep going. If they don&apos;t move, that&apos;s a signal to get more support.</p>
        <p className="mt-1.5 text-slate-600">Example: overall feel 4 on Day 1, 5 at Week 1, 6 at Week 2, target 7 — you&apos;re on your way.</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]" data-testid="weekly-tracker">
          <thead><tr><th className="text-left font-mono text-[11px] uppercase text-slate-400 font-normal py-2 w-[34%]">What you track</th>{COLS.map((c) => <th key={c.label} className="font-normal align-bottom px-1"><div className="font-mono text-[11px] uppercase text-slate-500">{c.label}</div><div className="text-[10px] text-slate-400 leading-tight">{c.hint}</div></th>)}</tr></thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className="border-t border-slate-100">
                <td className="py-2 pr-3"><div className="text-slate-800">{row.label}</div><div className="text-[11px] text-slate-400">{row.hint}</div></td>
                {COLS.map((c, j) => (
                  <td key={c.label} className="px-1"><input data-testid={`tracker-${i}-${j}`} inputMode="numeric" placeholder="–" value={tracker[`${i}-${j}`] || ""} onChange={(e) => setTracker({ ...tracker, [`${i}-${j}`]: e.target.value })}
                    onBlur={() => onSave({ tracker })} className="w-full h-9 rounded-lg bg-eq-bg text-center outline-none focus:ring-2 focus:ring-eq" /></td>
                ))}
              </tr>
            ))}
            <tr><td colSpan={5} className="pt-4 pb-1 font-mono text-[11px] uppercase text-slate-400">Filled in automatically from your plan ticks (days done out of 7)</td></tr>
            {r.plan.map((a, i) => (
              <tr key={a.id} className="border-t border-slate-100" data-testid={`tracker-auto-${i}`}>
                <td className="py-2 pr-3 text-slate-700">{a.name}</td>
                <td className="text-center text-slate-300">—</td>
                <td className="text-center font-mono">{doneIn(i, 0)}/7</td>
                <td className="text-center font-mono">{doneIn(i, 1)}/7</td>
                <td className="text-center text-slate-400 text-xs">5+/7</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {QUESTIONS.map((q, i) => (
          <label key={q} className="rounded-2xl border border-slate-100 p-4 block">
            <span className="text-sm font-medium text-slate-800">Sunday · {q}</span>
            <textarea data-testid={`reflection-${i}`} value={refl[i] || ""} onChange={(e) => setRefl({ ...refl, [i]: e.target.value })} onBlur={() => onSave({ reflections: refl })}
              rows={3} className="mt-2 w-full rounded-lg bg-eq-bg p-2 text-sm outline-none focus:ring-2 focus:ring-eq resize-none" placeholder="Write a line…" />
          </label>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-600 italic">If Week 2 looks the same as Day 1 — or worse — bring your counsellor appointment forward. A plan not moving is information, not failure.</p>
    </PageShell>
  );
};
