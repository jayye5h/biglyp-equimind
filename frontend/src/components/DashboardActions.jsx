import { Link } from "react-router-dom";
import { CalendarCheck, NotebookPen, ArrowRight } from "lucide-react";
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

export const ActionSections = ({ r }) => (
  <div className="space-y-6" data-testid="dashboard-action-sections">
    <div className="grid lg:grid-cols-2 gap-6"><PlanSummary r={r} /><TrackSummary r={r} /></div>
    <section data-testid="dashboard-help-section" className="rounded-2xl bg-white border border-eq/10 p-6 sm:p-8" style={toneVars(localStorage.getItem("eq_feature_tone"))}>
      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Who Can Help &amp; When to Ask</h3>
      <div className="mt-6"><HelpContent r={r} /></div>
    </section>
  </div>
);
