import { PageShell } from "@/components/report/PageShell";
import { weekStats, week1Writeup, trendInsights, bandName } from "@/lib/progress";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const Tile = ({ label, value, testid }) => (
  <div data-testid={testid} className="rounded-2xl bg-eq-bg p-4"><div className="text-[11px] font-mono uppercase text-slate-400">{label}</div><div className="mt-1 font-semibold text-slate-900">{value}</div></div>
);

export const Week1Page = ({ r, n, total }) => {
  const s = weekStats(r, 0);
  return (
    <PageShell n={n} total={total} eyebrow="Days 1–7" title="Week 1 Progress" id="week-1" testid="report-page-week-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-2">
        <Tile testid="week1-total" label="Activities done" value={`${s.total}/35 · ${s.pct}%`} />
        <Tile label="Mood days logged" value={`${s.moodDays}/7`} />
        <Tile label="Mostly felt" value={bandName(s.avgMood) || "—"} />
        <Tile label="Most consistent" value={s.best.short} />
      </div>
      <div className="mt-6 space-y-3">
        {s.acts.map((a) => (
          <div key={a.short}><div className="flex justify-between text-sm"><span className="text-slate-700">{a.name}</span><span className="font-mono text-xs text-slate-500">{a.done}/7</span></div>
            <div className="mt-1.5 h-2 rounded-full bg-eq-bg overflow-hidden"><div className="h-full bg-eq" style={{ width: `${(a.done / 7) * 100}%` }} /></div></div>
        ))}
      </div>
      <div className="mt-7 rounded-2xl bg-eq-soft p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">How your week went</h3>
        <p data-testid="week1-writeup" className="mt-3 text-slate-800 leading-relaxed">{week1Writeup(r, s)}</p>
      </div>
    </PageShell>
  );
};

const Delta = ({ d }) => (d > 0 ? <ArrowUpRight className="h-4 w-4 text-eq" /> : d < 0 ? <ArrowDownRight className="h-4 w-4 text-[#c2410c]" /> : <Minus className="h-4 w-4 text-slate-400" />);

export const Week2Page = ({ r, n, total }) => {
  const s1 = weekStats(r, 0);
  const s2 = weekStats(r, 1);
  const t = trendInsights(r, s1, s2);
  return (
    <PageShell n={n} total={total} eyebrow="Days 1–14" title="Your 14-Day Trend" id="week-2" testid="report-page-week-2">
      <div className="overflow-x-auto -mt-2">
        <table className="w-full text-sm min-w-[460px]" data-testid="trend-table">
          <thead><tr className="text-left font-mono text-[11px] uppercase text-slate-400"><th className="py-2 font-normal">Activity</th><th className="font-normal text-center">Week 1</th><th className="font-normal text-center">Week 2</th><th className="font-normal text-center">Change</th></tr></thead>
          <tbody>
            {s1.acts.map((a, i) => (
              <tr key={a.short} className="border-t border-slate-100"><td className="py-2.5 text-slate-700">{a.name}</td><td className="text-center font-mono">{a.done}/7</td><td className="text-center font-mono">{s2.acts[i].done}/7</td><td><span className="flex justify-center"><Delta d={s2.acts[i].done - a.done} /></span></td></tr>
            ))}
            <tr className="border-t-2 border-slate-200 font-semibold"><td className="py-2.5">All activities</td><td className="text-center font-mono">{s1.total}/35</td><td className="text-center font-mono">{s2.total}/35</td><td><span className="flex justify-center"><Delta d={s2.total - s1.total} /></span></td></tr>
            <tr className="border-t border-slate-100"><td className="py-2.5 text-slate-700">Mostly felt</td><td className="text-center">{bandName(s1.avgMood) || "—"}</td><td className="text-center">{bandName(s2.avgMood) || "—"}</td><td /></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-7 rounded-2xl bg-eq-soft p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">What the trend suggests</h3>
        <ul data-testid="trend-insights" className="mt-3 space-y-2">{t.lines.map((l) => <li key={l} className="flex gap-3 text-slate-800"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-eq shrink-0" />{l}</li>)}</ul>
      </div>
      <div data-testid="trend-next-step" className={`mt-4 rounded-2xl p-5 text-sm ${t.notMoving ? "bg-[#fff0ee] text-[#9a3412]" : "bg-[#fef3c7] text-[#92400e]"}`}><b>Next step:</b> {t.next}</div>
    </PageShell>
  );
};
