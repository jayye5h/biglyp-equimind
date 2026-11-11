import { PageShell, Art } from "@/components/report/PageShell";
import { weekStats, week1Writeup, week2Writeup, trendInsights, bandName, nextStepsPlan } from "@/lib/progress";
import { ArrowUpRight, ArrowDownRight, Minus, Check, CalendarCheck, SquareCheck, CalendarDays, Smile, Target, TrendingUp } from "lucide-react";

const Tile = ({ label, value, testid, icon: Icon }) => (
  <div data-testid={testid} className="rounded-2xl bg-eq-bg p-4 flex items-center gap-3">
    {Icon && <Icon className="h-7 w-7 shrink-0 text-eq" strokeWidth={1.5} />}
    <div className="min-w-0"><div className="text-[11px] font-mono uppercase text-slate-400">{label}</div><div className="mt-1 font-semibold text-slate-900">{value}</div></div>
  </div>
);

const WeekBody = ({ s, prev, w = 1, art = "/report-art/week.webp" }) => (
  <div className="mt-6 grid md:grid-cols-[0.8fr_1.2fr] gap-6 items-center [&>*]:min-w-0">
    <Art src={art} alt="Tracking progress" testid={`report-page-week-${w}-art`} className="max-w-[320px] mx-auto" />
    <Bars s={s} prev={prev} />
  </div>
);

const Writeup = ({ title, children, clip = "/report-art/week_clip.webp", testid }) => (
  <div data-testid={testid} className="mt-7 rounded-2xl bg-eq-soft p-6 grid sm:grid-cols-[120px_1fr] gap-5 items-center">
    <img src={clip} alt="" draggable={false} className="hidden sm:block w-full h-auto" />
    <div className="sm:border-l sm:border-eq/20 sm:pl-5">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">{title}</h3>
      {children}
    </div>
  </div>
);

const Delta = ({ d }) => (d > 0 ? <ArrowUpRight className="h-4 w-4 text-eq" /> : d < 0 ? <ArrowDownRight className="h-4 w-4 text-[#c2410c]" /> : <Minus className="h-4 w-4 text-slate-400" />);

const Bars = ({ s, prev }) => (
  <div className="space-y-3">
    {s.acts.map((a, i) => (
      <div key={a.short}><div className="flex justify-between items-center text-sm"><span className="text-slate-700">{a.name}</span>
        <span className="font-mono text-xs text-slate-500 inline-flex items-center gap-1.5">{prev && <>{prev.acts[i].done}/7 → </>}{a.done}/7{prev && <Delta d={a.done - prev.acts[i].done} />}</span></div>
        <div className="mt-1.5 h-2.5 rounded-full bg-eq-bg overflow-hidden"><div className="h-full bg-eq" style={{ width: `${(a.done / 7) * 100}%` }} /></div></div>
    ))}
  </div>
);

export const Week1Page = ({ r, n, total }) => {
  const s = weekStats(r, 0);
  return (
    <PageShell n={n} total={total} eyebrow="Days 1–7" title="Week 1 Progress" id="week-1" testid="report-page-week-1" inline>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-3">
        <Tile testid="week1-total" icon={SquareCheck} label="Activities done" value={`${s.total}/35 · ${s.pct}%`} />
        <Tile icon={CalendarDays} label="Full days (all 5)" value={`${s.fullDays}/7`} />
        <Tile icon={Smile} label="Mostly felt" value={bandName(s.avgMood) || "—"} />
        <Tile icon={Target} label="Most consistent" value={s.best.short} />
      </div>
      <WeekBody s={s} />
      <Writeup title="How your week went">
        <p data-testid="week1-writeup" className="mt-3 text-slate-800 leading-relaxed">{week1Writeup(r, s)}</p>
      </Writeup>
    </PageShell>
  );
};

export const Week2Page = ({ r, n, total }) => {
  const s1 = weekStats(r, 0);
  const s2 = weekStats(r, 1);
  const t = trendInsights(r, s1, s2);
  return (
    <PageShell n={n} total={total} eyebrow="Days 8–14" title="Week 2 Progress" id="week-2" testid="report-page-week-2" inline>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-3">
        <Tile testid="week2-total" icon={SquareCheck} label="Activities done" value={`${s2.total}/35 · ${s2.pct}%`} />
        <Tile icon={TrendingUp} label="vs Week 1" value={<span className="inline-flex items-center gap-1">{s2.total - s1.total >= 0 ? "+" : ""}{s2.total - s1.total} <Delta d={s2.total - s1.total} /></span>} />
        <Tile icon={CalendarDays} label="Full days (all 5)" value={`${s2.fullDays}/7`} />
        <Tile icon={Smile} label="Mostly felt" value={bandName(s2.avgMood) || "—"} />
      </div>
      <WeekBody s={s2} prev={s1} w={2} art="/report-art/week2_hero.webp" />
      <Writeup title="How your second week went" clip="/report-art/week2_clip.webp" testid="week2-writeup-box">
        <p data-testid="week2-writeup" className="mt-3 text-[17px] text-slate-800 leading-relaxed">{week2Writeup(r, s1, s2)}</p>
        <ul data-testid="trend-insights" className="mt-4 space-y-2">{t.lines.map((l) => <li key={l} className="flex gap-3 text-[15px] text-slate-700"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-eq shrink-0" />{l}</li>)}</ul>
      </Writeup>
    </PageShell>
  );
};

const OPTIONS = {
  same: { art: "/report-art/next_same.webp", tint: "bg-[#eef6fe]", title: "Continue with the same 5 habits", body: "Your rhythm is working. Keep the same five activities for the next two weeks and let them become automatic." },
  three: { art: "/report-art/next_three.webp", tint: "bg-[#fef2ee]", title: "Focus on 3 activities a day", body: "Doing all five every day was hard to keep up — that's very common. Shrink the plan to the three that suit you best, and do them well." },
  new: { art: "/report-art/next_new.webp", tint: "bg-[#f7f2fd]", title: "Take up new activities", body: "You're doing really well. Keep your two strongest habits on autopilot and add a fresh challenge from your focus areas." },
};

export const NextStepsPage = ({ r, n, total }) => {
  const ns = nextStepsPlan(r);
  return (
    <PageShell n={n} total={total} eyebrow="After Day 14" title="Your Next Steps" id="next-steps" testid="report-page-next-steps" inline
      side={<Art src="/report-art/next_head.webp" alt="Choosing the path ahead" testid="report-page-next-steps-art" className="max-w-[300px] sm:max-w-[380px] mx-auto md:ml-auto md:mr-0" />}>
      <p className="text-[17px] text-slate-700 leading-relaxed md:max-w-[80%] -mt-2">{ns.intro}</p>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {Object.entries(OPTIONS).map(([k, o]) => {
          const on = k === ns.path;
          return (
            <div key={k} data-testid={`next-option-${k}`} data-recommended={on} className={`relative rounded-2xl p-5 sm:p-6 border-2 ${o.tint} ${on ? "border-[#6d5ce7]" : "border-transparent"}`}>
              {on && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#6d5ce7] text-white text-[11px] font-semibold px-3 py-1">Recommended for you</span>}
              <img src={o.art} alt="" draggable={false} className="block mx-auto h-24 w-auto object-contain select-none" />
              <h3 className="mt-4 font-serif text-xl font-bold leading-snug text-slate-900">{o.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{o.body}</p>
            </div>
          );
        })}
      </div>
      <div data-testid="next-steps-list" className="mt-6 flow-root rounded-2xl bg-white border border-eq/15 p-5 sm:p-6">
        <img src="/report-art/next_study.webp" alt="" data-testid="next-steps-list-art" draggable={false} className="hidden md:block float-right w-[36%] max-w-[340px] ml-6 mb-2 select-none" />
        <h3 className="font-mono text-[12px] uppercase tracking-widest text-eq-dark">{ns.listTitle}</h3>
        <ul className="mt-4 space-y-4">
          {ns.items.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-eq text-white grid place-items-center"><Check className="h-4 w-4" strokeWidth={3} /></span>
              <div className="min-w-0"><p className="font-semibold text-[17px] text-slate-900">{a.name} <span className="text-sm font-normal text-slate-500">· {a.time}</span></p>{a.note && <p className="mt-0.5 text-[15px] text-slate-700">{a.note}</p>}</div>
            </li>
          ))}
        </ul>
      </div>
      <div data-testid="trend-next-step" className={`mt-6 rounded-2xl p-5 flex items-center gap-4 text-[15px] ${ns.notMoving ? "bg-[#fff0ee] text-[#9a3412]" : "bg-[#fef3c7] text-[#92400e]"}`}><CalendarCheck className="h-7 w-7 shrink-0" strokeWidth={1.6} /><p><b>Also:</b> {ns.closing}</p></div>
    </PageShell>
  );
};
