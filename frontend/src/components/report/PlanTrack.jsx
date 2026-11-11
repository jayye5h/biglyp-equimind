import { Clock, CalendarDays, Lightbulb, ListChecks } from "lucide-react";
import { PageShell } from "@/components/report/PageShell";

const Activity = ({ a, i }) => (
  <div data-testid={`plan-activity-${i}`} className="rounded-2xl border border-slate-100 p-5 sm:p-6" style={{ breakInside: "avoid" }}>
    <div className="flex items-start gap-4">
      <span className="h-10 w-10 shrink-0 rounded-xl bg-eq text-white font-serif text-lg font-bold grid place-items-center">{i + 1}</span>
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-xl font-bold text-slate-900">{a.name}</h3>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.time}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {a.when}</span>
        </div>
      </div>
    </div>
    {a.why && (
      <div className="mt-4 rounded-xl bg-eq-bg p-4 flex gap-3">
        <Lightbulb className="h-4 w-4 text-eq shrink-0 mt-0.5" />
        <div><p className="text-[11px] font-mono uppercase tracking-wider text-eq-dark">Why it helps</p><p data-testid={`plan-activity-why-${i}`} className="mt-1 text-sm text-slate-700 leading-relaxed">{a.why}</p></div>
      </div>
    )}
    <div className="mt-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 inline-flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> How to do it</p>
      <ol className="mt-2 space-y-1.5">
        {a.steps.map((s, k) => <li key={k} className="flex gap-3 text-sm text-slate-700"><span className="font-mono text-xs text-slate-400 mt-0.5">{k + 1}.</span>{s}</li>)}
      </ol>
    </div>
  </div>
);

export const PlanPage = ({ r, n, total }) => (
  <PageShell n={n} total={total} eyebrow="Your daily habits" title="Your 14-Day Plan" id="plan" testid="report-page-plan" art="/report-art/plan.webp" artAlt="Daily plan">
    <p className="text-slate-600 -mt-2">Five tiny activities, chosen from your check-in, with under 30 minutes of new effort a day. You log them each day in your <b>Daily Check-in</b> on the dashboard — here is what each one is and why it works.</p>
    <div className="mt-6 space-y-4">{r.plan.map((a, i) => <Activity key={a.id} a={a} i={i} />)}</div>
    <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
      <div className="rounded-2xl bg-eq-soft p-5"><h4 className="font-semibold text-eq-dark">What counts as a good day</h4><ul className="mt-2 space-y-1.5 text-slate-700"><li>3 or more activities done.</li><li>1 or 2 and you still showed up — count that too.</li><li>None today? Tomorrow is the restart, not next Monday.</li></ul></div>
      <div className="rounded-2xl bg-[#fef3c7] p-5"><h4 className="font-semibold text-[#92400e]">Minimum version</h4><p className="mt-2 text-slate-700">Just do activity 1 ({r.plan[0]?.short}) and activity 2 ({r.plan[1]?.short}). That still counts, and it protects everything else.</p></div>
      <div className="rounded-2xl bg-[#f3e8ff] p-5"><h4 className="font-semibold text-[#6d28d9]">Why so few</h4><p className="mt-2 text-slate-700">Because &apos;add 15 habits&apos; is how plans fail. These five are chosen so that even if you only do two, you&apos;re still working on your biggest areas.</p></div>
    </div>
  </PageShell>
);

export const BANDS = [
  { v: 0, l: "Struggling", c: "#f07167" }, { v: 1, l: "Rough", c: "#fb923c" }, { v: 2, l: "Mixed", c: "#fbbf24" },
  { v: 3, l: "Steady", c: "rgb(var(--eq-mid))" }, { v: 4, l: "Strong", c: "rgb(var(--eq-p))" },
];
