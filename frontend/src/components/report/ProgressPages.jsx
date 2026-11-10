import { PageShell } from "@/components/report/PageShell";
import { weekStats, week1Writeup, week2Writeup, trendInsights, bandName, nextStepsPlan } from "@/lib/progress";
import { ArrowUpRight, ArrowDownRight, Minus, Repeat, ListMinus, Rocket, Check } from "lucide-react";

const Tile = ({ label, value, testid }) => (
  <div data-testid={testid} className="rounded-2xl bg-eq-bg p-4"><div className="text-[11px] font-mono uppercase text-slate-400">{label}</div><div className="mt-1 font-semibold text-slate-900">{value}</div></div>
);

const Delta = ({ d }) => (d > 0 ? <ArrowUpRight className="h-4 w-4 text-eq" /> : d < 0 ? <ArrowDownRight className="h-4 w-4 text-[#c2410c]" /> : <Minus className="h-4 w-4 text-slate-400" />);

const Bars = ({ s, prev }) => (
  <div className="mt-6 space-y-3">
    {s.acts.map((a, i) => (
      <div key={a.short}><div className="flex justify-between items-center text-sm"><span className="text-slate-700">{a.name}</span>
        <span className="font-mono text-xs text-slate-500 inline-flex items-center gap-1.5">{prev && <>{prev.acts[i].done}/7 → </>}{a.done}/7{prev && <Delta d={a.done - prev.acts[i].done} />}</span></div>
        <div className="mt-1.5 h-2 rounded-full bg-eq-bg overflow-hidden"><div className="h-full bg-eq" style={{ width: `${(a.done / 7) * 100}%` }} /></div></div>
    ))}
  </div>
);

export const Week1Page = ({ r, n, total }) => {
  const s = weekStats(r, 0);
  return (
    <PageShell n={n} total={total} eyebrow="Days 1–7" title="Week 1 Progress" id="week-1" testid="report-page-week-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-2">
        <Tile testid="week1-total" label="Activities done" value={`${s.total}/35 · ${s.pct}%`} />
        <Tile label="Full days (all 5)" value={`${s.fullDays}/7`} />
        <Tile label="Mostly felt" value={bandName(s.avgMood) || "—"} />
        <Tile label="Most consistent" value={s.best.short} />
      </div>
      <Bars s={s} />
      <div className="mt-7 rounded-2xl bg-eq-soft p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">How your week went</h3>
        <p data-testid="week1-writeup" className="mt-3 text-slate-800 leading-relaxed">{week1Writeup(r, s)}</p>
      </div>
    </PageShell>
  );
};

export const Week2Page = ({ r, n, total }) => {
  const s1 = weekStats(r, 0);
  const s2 = weekStats(r, 1);
  const t = trendInsights(r, s1, s2);
  return (
    <PageShell n={n} total={total} eyebrow="Days 8–14" title="Week 2 Progress" id="week-2" testid="report-page-week-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-2">
        <Tile testid="week2-total" label="Activities done" value={`${s2.total}/35 · ${s2.pct}%`} />
        <Tile label="vs Week 1" value={<span className="inline-flex items-center gap-1">{s2.total - s1.total >= 0 ? "+" : ""}{s2.total - s1.total} <Delta d={s2.total - s1.total} /></span>} />
        <Tile label="Full days (all 5)" value={`${s2.fullDays}/7`} />
        <Tile label="Mostly felt" value={bandName(s2.avgMood) || "—"} />
      </div>
      <Bars s={s2} prev={s1} />
      <div className="mt-7 rounded-2xl bg-eq-soft p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">How your second week went</h3>
        <p data-testid="week2-writeup" className="mt-3 text-slate-800 leading-relaxed">{week2Writeup(r, s1, s2)}</p>
        <ul data-testid="trend-insights" className="mt-4 space-y-2">{t.lines.map((l) => <li key={l} className="flex gap-3 text-sm text-slate-700"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-eq shrink-0" />{l}</li>)}</ul>
      </div>
    </PageShell>
  );
};

const OPTIONS = {
  same: { icon: Repeat, title: "Continue with the same 5 habits", body: "Your rhythm is working. Keep the same five activities for the next two weeks and let them become automatic." },
  three: { icon: ListMinus, title: "Focus on 3 activities a day", body: "Doing all five every day was hard to keep up — that's very common. Shrink the plan to the three that suit you best, and do them well." },
  new: { icon: Rocket, title: "Take up new activities", body: "You're doing really well. Keep your two strongest habits on autopilot and add a fresh challenge from your focus areas." },
};

export const NextStepsPage = ({ r, n, total }) => {
  const ns = nextStepsPlan(r);
  return (
    <PageShell n={n} total={total} eyebrow="After Day 14" title="Your Next Steps" id="next-steps" testid="report-page-next-steps">
      <p className="text-slate-600 -mt-2">{ns.intro}</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {Object.entries(OPTIONS).map(([k, o]) => {
          const on = k === ns.path;
          return (
            <div key={k} data-testid={`next-option-${k}`} data-recommended={on} className={`relative rounded-2xl p-5 border-2 ${on ? "border-eq bg-eq-soft" : "border-slate-100 bg-white opacity-70"}`}>
              {on && <span className="absolute -top-3 left-4 rounded-full bg-eq text-white text-[10px] font-semibold px-2.5 py-0.5">Recommended for you</span>}
              <o.icon className={`h-6 w-6 ${on ? "text-eq-dark" : "text-slate-400"}`} />
              <h3 className="mt-3 font-semibold text-slate-900">{o.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{o.body}</p>
            </div>
          );
        })}
      </div>
      <div data-testid="next-steps-list" className="mt-6 rounded-2xl bg-white border border-eq/15 p-5 sm:p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">{ns.listTitle}</h3>
        <ul className="mt-3 space-y-3">
          {ns.items.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-eq text-white grid place-items-center"><Check className="h-3.5 w-3.5" /></span>
              <div><p className="font-medium text-slate-900">{a.name} <span className="text-xs font-normal text-slate-500">· {a.time}</span></p>{a.note && <p className="text-sm text-slate-600">{a.note}</p>}</div>
            </li>
          ))}
        </ul>
      </div>
      <div data-testid="trend-next-step" className={`mt-4 rounded-2xl p-5 text-sm ${ns.notMoving ? "bg-[#fff0ee] text-[#9a3412]" : "bg-[#fef3c7] text-[#92400e]"}`}><b>Also:</b> {ns.closing}</div>
    </PageShell>
  );
};
