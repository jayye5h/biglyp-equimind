import { Clock, CalendarDays, Lightbulb, ListChecks } from "lucide-react";
import { PageShell, Art, RImg } from "@/components/report/PageShell";

const ICON_BY_ID = { "fe-wake": "ic_wake", "fe-pomo": "ic_laptop", "fe-2min": "ic_laptop", "fe-checkin": "ic_breath", "fe-478": "ic_breath", "fe-askhelp": "ic_chat", "fe-buddy": "ic_chat", "fe-phone": "ic_check", "b-phone": "ic_check", "b-dump": "ic_check", "e-three": "ic_check", "b-wake": "ic_wake", "a-10min": "ic_laptop", "c-breath": "ic_breath", "f-money": "ic_chat", "c-checkin": "ic_check" };
const ICON_BY_AREA = { a: "ic_laptop", b: "ic_wake", c: "ic_breath", d: "ic_chat", e: "ic_check", f: "ic_chat" };
const POOL = ["ic_wake", "ic_laptop", "ic_breath", "ic_chat", "ic_check"];
export const planIcons = (plan) => {
  const used = new Set();
  return plan.map((a) => {
    const pref = ICON_BY_ID[a.id] || ICON_BY_AREA[a.id.split("-")[0]] || "ic_check";
    const pick = !used.has(pref) ? pref : POOL.find((x) => !used.has(x)) || pref;
    used.add(pick);
    return `/report-art/${pick}.webp`;
  });
};

const Activity = ({ a, i, icon }) => (
  <div data-testid={`plan-activity-${i}`} className="rounded-3xl border border-eq/10 bg-gradient-to-r from-eq-bg/70 to-white grid md:grid-cols-[1fr_1.25fr] overflow-hidden" style={{ breakInside: "avoid" }}>
    <div className="p-5 flex items-center gap-4">
      <RImg src={icon} alt="" data-testid={`plan-activity-icon-${i}`} draggable={false} className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 object-contain" />
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="h-8 w-8 shrink-0 rounded-lg bg-eq text-white font-semibold grid place-items-center">{i + 1}</span>
          <h3 className="font-serif text-xl font-bold text-slate-900 leading-snug">{a.name}</h3>
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-slate-600">
          <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" /> {a.time}</p>
          <p className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" /> {a.when}</p>
        </div>
      </div>
    </div>
    <div className="p-5 md:border-l border-t md:border-t-0 border-eq/10 bg-white/60">
      {a.why && (
        <div className="flex gap-3">
          <Lightbulb className="h-4 w-4 text-eq shrink-0 mt-0.5" />
          <div><p className="text-[11px] font-mono uppercase tracking-wider text-eq-dark">Why it helps</p><p data-testid={`plan-activity-why-${i}`} className="mt-1 text-sm text-slate-700 leading-relaxed">{a.why}</p></div>
        </div>
      )}
      <div className={`flex gap-3 ${a.why ? "mt-4 pt-4 border-t border-eq/10" : ""}`}>
        <ListChecks className="h-4 w-4 text-eq shrink-0 mt-0.5" />
        <div><p className="text-[11px] font-mono uppercase tracking-wider text-eq-dark">How to do it</p>
          <ol className="mt-1.5 space-y-1">
            {a.steps.map((st, k) => <li key={k} className="flex gap-2 text-sm text-slate-700"><span className="text-slate-500">{k + 1}.</span>{st}</li>)}
          </ol>
        </div>
      </div>
    </div>
  </div>
);

export const PlanPage = ({ r, n, total }) => (
  <PageShell n={n} total={total} eyebrow="Your daily habits" title="Your 14-Day Plan" id="plan" testid="report-page-plan" inline
    side={<Art src="/report-art/plan_head.webp" alt="Planning daily habits" testid="report-page-plan-art" className="max-w-[340px] ml-auto" />}
    headExtra={<p className="text-slate-600 -mt-2">{r.programme === "focusedge" ? "Two phases — Week 1 Notice, Week 2 Start small. Five tiny activities, chosen from your check-in, with under 25 minutes of new effort a day." : "Five tiny activities, chosen from your check-in, with under 30 minutes of new effort a day."} You log them each day in your <b>Daily Check-in</b> on the dashboard — here is what each one is and why it works.</p>}>
    <div className="space-y-4">{(() => { const ic = planIcons(r.plan); return r.plan.map((a, i) => <Activity key={a.id} a={a} i={i} icon={ic[i]} />); })()}</div>
    {r.programme === "focusedge" && (
      <div data-testid="plan-phases" className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl bg-[#e9f7f1] p-5"><h4 className="font-semibold text-[#2e7c63]">Week 1 (Days 1–7) · Notice</h4><p className="mt-2 text-slate-700">Protect sleep, set up your study space, do a 2-minute start, keep your phone in another room. Notice when attention drifts — don&apos;t judge, just notice. Goal: see the pattern.</p></div>
        <div className="rounded-2xl bg-[#fef3c7] p-5"><h4 className="font-semibold text-[#92400e]">Week 2 (Days 8–14) · Start small</h4><p className="mt-2 text-slate-700">Keep the Week-1 anchors. Add one 25-minute focus block. Ask a parent or teacher for help with one thing. Celebrate small wins — a tick is still a tick.</p></div>
      </div>
    )}
    <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
      <div className="rounded-2xl bg-eq-soft p-5"><h4 className="font-semibold text-eq-dark">What counts as a good day</h4><ul className="mt-2 space-y-1.5 text-slate-700"><li>3 or more activities done.</li><li>1 or 2 and you still showed up — count that too.</li><li>None today? Tomorrow is the restart, not next Monday.</li></ul></div>
      <div className="rounded-2xl bg-[#fef3c7] p-5"><h4 className="font-semibold text-[#92400e]">Minimum version</h4>{(() => { const k = r.programme === "focusedge" ? Math.max(1, r.plan.findIndex((a) => a.id === "fe-2min")) : 1; return <p className="mt-2 text-slate-700">Just do activity 1 ({r.plan[0]?.short}) and activity {k + 1} ({r.plan[k]?.short}). That still counts, and it protects everything else.</p>; })()}</div>
      <div className="rounded-2xl bg-[#f3e8ff] p-5"><h4 className="font-semibold text-[#6d28d9]">Why so few</h4><p className="mt-2 text-slate-700">Because &apos;add 15 habits&apos; is how plans fail. These five are chosen so that even if you only do two, you&apos;re still working on your biggest areas.</p></div>
    </div>
  </PageShell>
);

export const BANDS = [
  { v: 0, l: "Struggling", c: "#f07167" }, { v: 1, l: "Rough", c: "#fb923c" }, { v: 2, l: "Mixed", c: "#fbbf24" },
  { v: 3, l: "Steady", c: "rgb(var(--eq-mid))" }, { v: 4, l: "Strong", c: "rgb(var(--eq-p))" },
];
