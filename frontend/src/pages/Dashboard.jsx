import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, CalendarCheck, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AppHeader, SafetyStrip } from "@/components/Shell";
import { api, fmtDate, LEVEL_STYLE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ActionSections } from "@/components/DashboardActions";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme";

const levelOf = (s) => (s < 35 ? "Needs care first" : s < 50 ? "Watch" : s < 65 ? "Steady" : "Strength");

const LatestCard = ({ r }) => {
  const done = r.ticks?.length || 0;
  const retake = new Date(new Date(r.created_at).getTime() + 30 * 864e5);
  return (
    <div data-testid="latest-report-card" className="rounded-[2rem] bg-white border border-eq/10 p-6 sm:p-8 grid md:grid-cols-[auto_1fr] gap-8">
      <div className="h-36 w-36 rounded-full border-[10px] border-eq-soft grid place-items-center">
        <div className="text-center"><div data-testid="latest-overall-score" className="font-serif text-4xl font-bold text-slate-900">{r.overall}</div><div className="text-xs text-slate-500">overall / 100</div></div>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">{fmtDate(r.created_at)}</span>
          <span data-testid="latest-path-badge" className={`text-xs rounded-full px-3 py-1 border ${r.path === 2 ? LEVEL_STYLE["Needs care first"] : LEVEL_STYLE.Steady}`}>{r.path === 2 ? "Counsellor recommended" : "Strengthening path"}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {r.areas.map((a) => (
            <div key={a.key} className={`rounded-xl border px-2 py-2 ${LEVEL_STYLE[a.level]}`}><div className="font-mono font-semibold">{a.score}</div><div className="text-[10px] leading-tight">{a.short}</div></div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/report/${r.id}`} data-testid="view-latest-report-btn" className="h-11 px-5 rounded-xl bg-eq text-white text-sm font-medium inline-flex items-center gap-2 hover:bg-eq-dark transition-colors"><FileText className="h-4 w-4" /> Open report</Link>
          <Link to={`/report/${r.id}#plan`} data-testid="view-plan-btn" className="h-11 px-5 rounded-xl bg-[#fff0ee] text-[#c2410c] text-sm font-medium inline-flex items-center gap-2 hover:bg-[#ffe4e0] transition-colors"><CalendarCheck className="h-4 w-4" /> 14-day plan · {done}/70 ticks</Link>
        </div>
        <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Scheduled Day-30 retake: <b data-testid="day30-date">{fmtDate(retake.toISOString())}</b> (same 24 items for a fair comparison)</p>
      </div>
    </div>
  );
};

const History = ({ reports }) => {
  const { palette } = useTheme();
  const data = [...reports].reverse().map((r, i) => ({ n: `#${i + 1}`, overall: r.overall }));
  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
      <div className="rounded-2xl bg-white border border-eq/10 p-6">
        <h3 className="font-serif text-xl font-semibold">Past check-ins</h3>
        <div className="mt-4 divide-y divide-eq/10">
          {reports.map((r) => (
            <Link key={r.id} to={`/report/${r.id}`} data-testid={`history-row-${r.id}`} className="flex items-center justify-between py-3 hover:bg-eq-bg -mx-2 px-2 rounded-lg transition-colors">
              <span className="text-sm text-slate-700">{fmtDate(r.created_at)}</span>
              <span className="flex items-center gap-3"><span className={`text-xs rounded-full px-2.5 py-0.5 border ${LEVEL_STYLE[levelOf(r.overall)]}`}>{r.overall}</span><ArrowRight className="h-4 w-4 text-slate-400" /></span>
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-eq/10 p-6">
        <h3 className="font-serif text-xl font-semibold">Overall trend</h3>
        {data.length < 2 ? <p className="mt-4 text-sm text-slate-500">Your trend appears after your second check-in.</p> : (
          <div className="h-48 mt-4" data-testid="trend-chart">
            <ResponsiveContainer><LineChart data={data}><XAxis dataKey="n" fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} width={28} /><Tooltip /><Line dataKey="overall" stroke={palette.p} strokeWidth={2.5} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    api.get("/reports").then((r) => {
      setReports(r.data);
      if (r.data[0]) api.get(`/reports/${r.data[0].id}`).then((x) => setLatest(x.data));
    });
  }, []);

  const saveLatest = (patch) => {
    setLatest((p) => ({ ...p, ...patch }));
    api.patch(`/reports/${latest.id}/progress`, patch).then(() => toast.success("Mood logged")).catch(() => toast.error("Could not save. Please try again."));
  };

  return (
    <div data-testid="student-dashboard" className="min-h-screen">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 eq-rise">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-eq">{user.program} · {user.year}</p>
            <h1 data-testid="dashboard-greeting" className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-slate-900">Hi {user.name.split(" ")[0]}, <em className="text-eq">breathe.</em></h1>
            <p className="mt-3 text-slate-600 max-w-xl">Think about the last two weeks. Your check-in takes about 6 minutes and stays private to you.</p>
          </div>
          <Link to="/check-in" data-testid="start-checkin-btn" className="h-14 px-7 rounded-2xl bg-eq text-white font-medium inline-flex items-center gap-2 hover:bg-eq-dark transition-colors shadow-lg shadow-eq/20 self-start md:self-auto">
            {reports?.length ? "Take a new check-in" : "Start your first check-in"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {reports === null ? <div className="h-48 rounded-[2rem] bg-white/60 animate-pulse" /> : reports.length === 0 ? (
          <div data-testid="empty-state" className="rounded-[2rem] bg-white border border-dashed border-eq/30 p-10 text-center">
            <h3 className="font-serif text-2xl font-semibold">No check-ins yet</h3>
            <p className="mt-2 text-slate-500">Your first report and 14-day plan will appear here.</p>
          </div>
        ) : (<><LatestCard r={reports[0]} /><History reports={reports} />{latest && <ActionSections r={latest} onSave={saveLatest} />}</>)}
        <SafetyStrip testid="dashboard-safety-strip" />
      </main>
    </div>
  );
}
