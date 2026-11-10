import { elapsedDays } from "@/lib/progress";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { PageShell, Pill } from "@/components/report/PageShell";
import { fmtDate, LEVEL_STYLE } from "@/lib/api";
import { useTheme } from "@/lib/theme";

const nameOf = (r, k) => r.areas.find((a) => a.key === k);
export const nextStep = (r) => (r.path === 2 ? "Start the 14-day plan today and book a campus counsellor this week" : "Start the 14-day plan today and protect your strengths");

export const CoverPage = ({ r, n, total }) => {
  const low = nameOf(r, r.priorities[0]);
  return (
    <PageShell n={n} total={total} dark eyebrow="Your stress check-in" id="cover" testid="report-page-cover">
      <div className="relative">
        <div className="absolute -right-24 -top-40 h-80 w-80 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute -right-10 -top-20 h-44 w-44 rounded-full bg-white/20 blur-xl" />
        <h1 className="relative font-serif text-5xl sm:text-6xl font-bold">EquiMind</h1>
        <p className="relative mt-3 font-serif italic text-xl ft-accent">Understand it. Act on it.</p>
        <div className="relative mt-10 grid sm:grid-cols-2 gap-6 text-sm">
          <div><div className="ft-faint font-mono text-[11px] uppercase tracking-widest">Prepared for</div><div data-testid="cover-student-name" className="mt-1 text-xl font-semibold">{r.student.name}</div><div className="ft-muted">{r.student.program} · {r.student.year} · {r.student.institution}</div></div>
          <div><div className="ft-faint font-mono text-[11px] uppercase tracking-widest">Check-in</div><div className="mt-1 text-xl font-semibold">{fmtDate(r.created_at)}</div><div className="ft-muted">24 items · two-week recall · ID {r.student.student_code}</div></div>
        </div>
        <div className="relative mt-10 rounded-2xl ft-glass backdrop-blur-md border p-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div><div className="text-[11px] font-mono uppercase ft-faint">Overall</div><div data-testid="cover-overall" className="font-serif text-3xl font-bold">{r.overall}<span className="text-base ft-faint">/100</span></div></div>
          <div><div className="text-[11px] font-mono uppercase ft-faint">Needs care first</div><div className="font-semibold mt-1">{low.short} {low.score}</div></div>
          <div><div className="text-[11px] font-mono uppercase ft-faint">Your resources</div><div className="font-semibold mt-1">{r.resources.length ? r.resources.map((k) => `${nameOf(r, k).short} ${nameOf(r, k).score}`).join(" · ") : "Still building"}</div></div>
          <div><div className="text-[11px] font-mono uppercase ft-faint">Next step</div><div className="font-semibold mt-1 ft-accent">{elapsedDays(r) >= 14 ? "See your next steps" : r.path === 2 ? "Plan + counsellor" : "Start the plan"}</div></div>
        </div>
        <p className="relative mt-8 text-sm ft-muted">This is a self-reflection and action report — not a diagnosis.</p>
      </div>
    </PageShell>
  );
};

const Tile = ({ label, value, tone, testid }) => (
  <div data-testid={testid} className={`rounded-2xl p-5 ${tone}`}><div className="text-[11px] font-mono uppercase tracking-wider opacity-70">{label}</div><div className="mt-2 font-semibold leading-snug">{value}</div></div>
);

export const SnapshotPage = ({ r, n, total, print }) => {
  const { palette } = useTheme();
  const data = r.areas.map((a) => ({ area: a.short, score: a.score }));
  const prev = r.previous ? Object.fromEntries(r.previous.areas.map((a) => [a.key, a.score])) : null;
  return (
    <PageShell n={n} total={total} eyebrow="Page 2" title="Your Snapshot" id="snapshot" testid="report-page-snapshot">
      <div className="grid lg:grid-cols-2 gap-8 items-center [&>*]:min-w-0">
        <div className="w-full min-w-0 h-[300px]" data-testid="radar-chart">
          <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={print ? "70%" : "62%"} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke={palette.grid} />
            <PolarAngleAxis dataKey="area" tick={{ fontSize: 11, fill: "#475569" }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="score" stroke={palette.p} fill={palette.p} fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
          </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Tile testid="tile-overall" label="Overall feel" value={`${r.overall}/100`} tone="bg-eq-soft text-eq-dark" />
          <Tile testid="tile-priorities" label="Three to work on first" value={r.priorities.map((k) => nameOf(r, k).short).join(", ")} tone="bg-[#fff0ee] text-[#c2410c]" />
          <Tile testid="tile-resources" label="Your resources" value={r.resources.length ? r.resources.map((k) => nameOf(r, k).short).join(", ") : "Still building — every area needs some care right now"} tone="bg-[#f3e8ff] text-[#6d28d9]" />
          <Tile testid="tile-next-step" label="Next step" value={nextStep(r)} tone="bg-[#fef3c7] text-[#92400e]" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {r.areas.map((a) => (
          <div key={a.key} data-testid={`area-score-${a.key}`} className="rounded-xl border border-slate-100 p-3 sm:p-4 flex items-center justify-between gap-2">
            <div><div className="text-sm font-medium text-slate-700">{a.name}</div><Pill className={`mt-1.5 whitespace-nowrap text-[11px] ${LEVEL_STYLE[a.level]}`}>{a.level}</Pill></div>
            <div className="text-right"><div className="font-mono text-2xl font-semibold text-slate-900">{a.score}</div>
              {prev && prev[a.key] !== undefined && <div className={`text-[11px] font-mono ${a.score - prev[a.key] >= 0 ? "text-eq" : "text-[#c2410c]"}`}>{a.score - prev[a.key] >= 0 ? "+" : ""}{a.score - prev[a.key]} vs last</div>}
            </div>
          </div>
        ))}
      </div>
      <p data-testid="honest-line" className="mt-8 font-serif text-xl text-slate-800 leading-relaxed"><b>One honest line:</b> {r.narrative.honest_line}</p>
      <p className="mt-3 text-sm text-slate-500">Nothing here is a verdict on you — it&apos;s a map to act on. This report shows what each area means, and gives you small, doable actions for the next 14 days.</p>
    </PageShell>
  );
};
