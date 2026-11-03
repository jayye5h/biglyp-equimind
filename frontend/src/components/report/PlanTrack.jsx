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
    <PageShell n={n} total={total} eyebrow="Page 7" title="Your 14-Day Starter Plan" id="plan" testid="report-page-plan">
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
                      className={`h-8 w-full min-w-[28px] rounded-lg grid place-items-center transition-colors ${on ? "bg-[#2d8a7c] text-white" : "bg-[#f0fbf9] hover:bg-[#d6efe9]"}`}>{on && <Check className="h-4 w-4" />}</button></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p data-testid="plan-tick-count" className="mt-3 text-xs font-mono text-slate-500">{ticks.size} / 70 ticks</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-2xl bg-[#e6f4f1] p-5"><h4 className="font-semibold text-[#226b60]">What counts as a good day</h4><ul className="mt-2 space-y-1.5 text-slate-700"><li>3 or more ticks.</li><li>1 or 2 ticks and you still showed up — count that too.</li><li>Zero ticks? Tomorrow is the restart, not next Monday.</li></ul></div>
        <div className="rounded-2xl bg-[#fef3c7] p-5"><h4 className="font-semibold text-[#92400e]">Minimum version</h4><p className="mt-2 text-slate-700">Just do activity 1 ({r.plan[0]?.short}) and activity 2 ({r.plan[1]?.short}). That still counts, and it protects everything else.</p></div>
        <div className="rounded-2xl bg-[#f3e8ff] p-5"><h4 className="font-semibold text-[#6d28d9]">Why so few</h4><p className="mt-2 text-slate-700">Because &apos;add 15 habits&apos; is how plans fail. These five are chosen so that even if you only do two, you&apos;re still working on your biggest areas.</p></div>
      </div>
    </PageShell>
  );
};

const BANDS = [
  { v: 0, l: "Struggling", c: "#f07167" }, { v: 1, l: "Rough", c: "#fb923c" }, { v: 2, l: "Mixed", c: "#fbbf24" },
  { v: 3, l: "Steady", c: "#5eb8a9" }, { v: 4, l: "Strong", c: "#2d8a7c" },
];
const ROWS = ["Overall feel (1-10)", "Nights of good sleep", "10-minute starts", "Honest sentences"];
const COLS = ["Day 1", "Week 1", "Week 2", "Target"];
const QUESTIONS = ["What was one thing that helped this week?", "What was one thing that got in the way?", "What's one small change I'll try next week?"];

const MoodStrip = ({ r, onSave }) => {
  const elapsed = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5);
  const [day, setDay] = useState(Math.min(elapsed, 13));
  const moods = r.moods || {};
  return (
    <div className="rounded-2xl bg-[#f0fbf9] p-6">
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
            style={{ background: moods[d] !== undefined ? BANDS[moods[d]].c : "#ffffff", color: moods[d] !== undefined ? "#fff" : "#94a3b8" }}>{d + 1}</button>
        ))}
      </div>
    </div>
  );
};

export const TrackPage = ({ r, n, total, onSave }) => {
  const [tracker, setTracker] = useState(r.tracker || {});
  const [refl, setRefl] = useState(r.reflections || {});
  return (
    <PageShell n={n} total={total} eyebrow="Page 8" title="Track & Reflect" id="track" testid="report-page-track">
      <MoodStrip r={r} onSave={onSave} />
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]" data-testid="weekly-tracker">
          <thead><tr><th className="text-left font-mono text-[11px] uppercase text-slate-400 font-normal py-2">Weekly tracker</th>{COLS.map((c) => <th key={c} className="font-mono text-[11px] uppercase text-slate-400 font-normal">{c}</th>)}</tr></thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row} className="border-t border-slate-100">
                <td className="py-2 pr-3 text-slate-700">{row}</td>
                {COLS.map((c, j) => (
                  <td key={c} className="px-1"><input data-testid={`tracker-${i}-${j}`} value={tracker[`${i}-${j}`] || ""} onChange={(e) => setTracker({ ...tracker, [`${i}-${j}`]: e.target.value })}
                    onBlur={() => onSave({ tracker })} className="w-full h-9 rounded-lg bg-[#f0fbf9] text-center outline-none focus:ring-2 focus:ring-[#2d8a7c]" /></td>
                ))}
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
              rows={3} className="mt-2 w-full rounded-lg bg-[#f0fbf9] p-2 text-sm outline-none focus:ring-2 focus:ring-[#2d8a7c] resize-none" placeholder="Write a line…" />
          </label>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-600 italic">If Week 2 looks the same as Day 1 — or worse — bring your counsellor appointment forward. A plan not moving is information, not failure.</p>
    </PageShell>
  );
};
