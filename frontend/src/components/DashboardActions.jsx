import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, NotebookPen, ArrowRight, Smile } from "lucide-react";
import { BANDS } from "@/components/report/PlanTrack";
import { HelpContent } from "@/components/report/HelpBodyAbout";
import { toneVars } from "@/lib/featureTones";

const CardShell = ({ to, testid, icon: Icon, title, tone, children }) => (
  <Link to={to} data-testid={testid} className="group block rounded-2xl bg-white border border-eq/10 p-6 hover:border-eq/40 hover:shadow-md transition-[border-color,box-shadow] duration-200">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3"><span className={`h-10 w-10 rounded-xl grid place-items-center ${tone}`}><Icon className="h-5 w-5" /></span><h3 className="font-serif text-xl font-semibold text-slate-900">{title}</h3></div>
      <span className="text-sm text-eq inline-flex items-center gap-1 group-hover:gap-2 transition-[gap]">Fill in <ArrowRight className="h-4 w-4" /></span>
    </div>
    <div className="mt-5">{children}</div>
  </Link>
);

const PlanSummary = ({ r }) => {
  const ticks = new Set(r.ticks || []);
  const day = Math.min(Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5) + 1, 14);
  return (
    <CardShell to={`/report/${r.id}#plan`} testid="dashboard-plan-summary" icon={CalendarCheck} title="Your 14-Day Starter Plan" tone="bg-[#fff0ee] text-[#c2410c]">
      <p className="text-sm text-slate-500">Day <b className="text-slate-800">{day}</b> of 14 · <span data-testid="dashboard-plan-ticks"><b className="text-slate-800">{ticks.size}</b> / 70 ticks</span></p>
      <div className="mt-4 space-y-3">
        {r.plan.map((a, i) => {
          const done = Array.from({ length: 14 }, (_, d) => ticks.has(`${i}-${d}`)).filter(Boolean).length;
          return (
            <div key={a.id} data-testid={`dashboard-plan-row-${i}`}>
              <div className="flex justify-between text-sm"><span className="text-slate-700"><span className="font-mono text-xs text-slate-400 mr-2">{i + 1}</span>{a.short}</span><span className="font-mono text-xs text-slate-500">{done}/14</span></div>
              <div className="mt-1.5 h-1.5 rounded-full bg-eq-bg overflow-hidden"><div className="h-full bg-eq transition-[width] duration-500" style={{ width: `${(done / 14) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
};

const TrackSummary = ({ r }) => {
  const moods = r.moods || {};
  const trackerFilled = Object.values(r.tracker || {}).filter((v) => String(v).trim()).length;
  const reflFilled = Object.values(r.reflections || {}).filter((v) => String(v).trim()).length;
  return (
    <CardShell to={`/report/${r.id}#track`} testid="dashboard-track-summary" icon={NotebookPen} title="Track & Reflect" tone="bg-eq-soft text-eq-dark">
      <p className="text-sm text-slate-500">Mood strip · <b className="text-slate-800">{Object.keys(moods).length}</b> of 14 days logged</p>
      <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }} data-testid="dashboard-mood-strip">
        {Array.from({ length: 14 }, (_, d) => (
          <span key={d} title={BANDS[moods[d]]?.l || `Day ${d + 1}`} className="h-7 rounded-md text-[9px] font-mono grid place-items-center border border-slate-100"
            style={{ background: BANDS[moods[d]]?.c || "#fff", color: BANDS[moods[d]] ? "#fff" : "#64748b" }}>{d + 1}</span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-eq-bg p-3"><div className="font-mono text-lg font-semibold text-slate-900" data-testid="dashboard-tracker-count">{trackerFilled}/16</div><div className="text-xs text-slate-500">Weekly tracker entries</div></div>
        <div className="rounded-xl bg-eq-bg p-3"><div className="font-mono text-lg font-semibold text-slate-900" data-testid="dashboard-reflection-count">{reflFilled}/3</div><div className="text-xs text-slate-500">Sunday reflections</div></div>
      </div>
    </CardShell>
  );
};

const MoodTap = ({ r, onSave }) => {
  const elapsed = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5);
  const moods = r.moods || {};
  const today = moods[elapsed];
  if (elapsed > 13) return null;
  return (
    <div data-testid="dashboard-mood-tap" className="rounded-2xl bg-white border border-eq/10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3 md:w-64 shrink-0">
        <span className="h-10 w-10 rounded-xl grid place-items-center bg-eq-soft text-eq-dark"><Smile className="h-5 w-5" /></span>
        <div><div className="font-semibold text-slate-800">How are you feeling today?</div><div data-testid="dashboard-mood-status" className="text-xs text-slate-500">Day {elapsed + 1} of 14 · {today !== undefined ? `logged as ${BANDS[today].l}` : "one tap to log"}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {BANDS.map((b) => (
          <button key={b.v} data-testid={`dashboard-mood-${b.v}`} aria-pressed={today === b.v} onClick={() => onSave({ moods: { ...moods, [elapsed]: b.v } })}
            className={`h-10 px-4 rounded-full text-sm border transition-colors ${today === b.v ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
            style={today === b.v ? { background: b.c } : {}}>{b.l}</button>
        ))}
      </div>
    </div>
  );
};

const MoodWeek = ({ r }) => {
  const moods = r.moods || {};
  const elapsed = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5);
  const [week, setWeek] = useState(elapsed >= 7 ? 1 : 0);
  const days = Array.from({ length: 7 }, (_, i) => week * 7 + i);
  const logged = days.filter((d) => BANDS[moods[d]]);
  const avg = logged.length ? logged.reduce((s, d) => s + moods[d], 0) / logged.length : null;
  return (
    <div data-testid="dashboard-mood-week" className="rounded-2xl bg-white border border-eq/10 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="font-semibold text-slate-800">Your mood this week</div>
          <div data-testid="mood-week-summary" className="text-xs text-slate-500">{avg === null ? "No moods logged yet this week" : `${logged.length} of 7 days logged · mostly ${BANDS[Math.round(avg)].l}`}</div></div>
        <div className="flex rounded-full bg-eq-bg p-1">
          {[0, 1].map((w) => (
            <button key={w} data-testid={`mood-week-tab-${w + 1}`} onClick={() => setWeek(w)}
              className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${week === w ? "bg-eq text-white" : "text-slate-600 hover:text-slate-900"}`}>Week {w + 1}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-end gap-2 sm:gap-4 h-32">
        {days.map((d) => {
          const b = BANDS[moods[d]];
          return (
            <div key={d} data-testid={`mood-week-bar-${d}`} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5" title={b ? b.l : "Not logged"}>
              <div className="w-full max-w-[44px] rounded-lg transition-[height] duration-500" style={{ height: b ? `${((moods[d] + 1) / 5) * 100}%` : "6px", background: b ? b.c : "#e2e8f0" }} />
              <span className={`text-[10px] font-mono ${d === elapsed ? "text-slate-900 font-semibold" : "text-slate-400"}`}>D{d + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">{BANDS.map((b) => <span key={b.v} className="text-[10px] text-slate-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: b.c }} />{b.l}</span>)}</div>
    </div>
  );
};

export const ActionSections = ({ r, onSave }) => (
  <div className="space-y-6" data-testid="dashboard-action-sections">
    <MoodTap r={r} onSave={onSave} />
    <MoodWeek r={r} />
    <div className="grid lg:grid-cols-2 gap-6"><PlanSummary r={r} /><TrackSummary r={r} /></div>
    <section data-testid="dashboard-help-section" className="rounded-2xl bg-white border border-eq/10 p-6 sm:p-8" style={toneVars(localStorage.getItem("eq_feature_tone"))}>
      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Who Can Help &amp; When to Ask</h3>
      <div className="mt-6"><HelpContent r={r} /></div>
    </section>
  </div>
);
