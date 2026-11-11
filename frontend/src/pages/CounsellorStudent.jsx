import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, Check, X, Minus } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/Shell";
import { api, errMsg } from "@/lib/api";
import { elapsedDays, weekStats } from "@/lib/progress";
import { BANDS } from "@/components/report/PlanTrack";
import { HELPFUL_L, FEEL_L, FEEL_TONE } from "@/lib/feedback";
import { fmtDay, fmtTime, STATUS_TONE } from "@/components/home/CounsellorCard";
import { SevChip, BookingActions } from "@/pages/Counsellor";

const Card = ({ title, children, testid, className = "" }) => (
  <section data-testid={testid} className={`rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-6 ${className}`}>
    {title && <h2 className="font-serif text-xl font-bold text-slate-900">{title}</h2>}
    <div className={title ? "mt-4" : ""}>{children}</div>
  </section>
);

const DayTable = ({ r }) => {
  const ticks = new Set(r.ticks || []);
  const logged = new Set(r.logged_days || []);
  const today = Math.min(Math.max(elapsedDays(r), 0), 13);
  const notes = r.daily_notes || {};
  const fb = r.feedback || {};
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[860px]" data-testid="day-record-table">
        <thead><tr className="text-left text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <th className="py-2 px-1">Day</th><th className="py-2 px-1">Mood</th>
          {r.plan.map((a, i) => <th key={a.id} className="py-2 px-1 text-center" title={a.name}>{i + 1}. {a.short}</th>)}
          <th className="py-2 px-1">Stress · feeling</th><th className="py-2 px-1">Feedback</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: Math.min(today + 1, 14) }, (_, d) => {
            const m = (r.moods || {})[d];
            const n = notes[d] || {};
            const f = fb[d];
            return (
              <tr key={d} data-testid={`day-row-${d}`} className={logged.has(d) ? "" : "text-slate-400"}>
                <td className="py-2.5 px-1 font-medium whitespace-nowrap">Day {d + 1}{!logged.has(d) && <span className="block text-[10px]">{d === today ? "today · pending" : "not logged"}</span>}</td>
                <td className="py-2.5 px-1">{BANDS[m] ? <span className="rounded-full px-2 py-0.5 text-xs text-white" style={{ background: BANDS[m].c }}>{BANDS[m].l}</span> : "—"}</td>
                {r.plan.map((a, i) => <td key={a.id} className="py-2.5 px-1 text-center">{!logged.has(d) ? <Minus className="inline h-4 w-4 text-slate-200" /> : ticks.has(`${i}-${d}`) ? <Check className="inline h-4 w-4 text-eq" /> : <X className="inline h-4 w-4 text-rose-300" />}</td>)}
                <td className="py-2.5 px-1 whitespace-nowrap">{n.stress !== undefined ? <span className={n.stress >= 8 ? "text-rose-600 font-semibold" : ""}>{n.stress}/10</span> : "—"}{n.feeling ? ` · ${n.feeling}` : ""}</td>
                <td className="py-2.5 px-1">{f ? <div><span className="text-xs text-slate-700">{HELPFUL_L[f.helpful]}</span> <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${FEEL_TONE[f.feel]}`}>{FEEL_L[f.feel]}</span>{f.comment && <p className="mt-0.5 text-xs italic text-slate-500">&ldquo;{f.comment}&rdquo;</p>}</div> : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function CounsellorStudent() {
  const { uid } = useParams();
  const [d, setD] = useState(null);
  const [slots, setSlots] = useState(null);
  const [notes, setNotes] = useState({});
  const load = useCallback(() => {
    api.get(`/counsellor/students/${uid}`).then((r) => setD(r.data)).catch((e) => toast.error(errMsg(e)));
    api.get("/counsellor/slots").then((r) => setSlots(r.data)).catch(() => {});
  }, [uid]);
  useEffect(() => { load(); }, [load]);
  const saveNote = async (b) => {
    try { await api.patch(`/counsellor/bookings/${b.id}`, { counsellor_note: notes[b.id] ?? b.counsellor_note }); toast.success("Note saved"); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  if (!d) return <div className="min-h-screen bg-eq-bg"><AppHeader /><div className="max-w-6xl mx-auto p-8"><div className="h-80 rounded-[2rem] bg-white/60 animate-pulse" /></div></div>;
  const r = d.report;
  const s1 = r && weekStats(r, 0);
  const s2 = r && weekStats(r, 1);
  return (
    <div className="min-h-screen bg-eq-bg">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <Link to="/counsellor" data-testid="back-to-counsellor" className="text-sm text-eq inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> All students</Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 data-testid="student-detail-name" className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">{d.student.name}</h1>
            <p className="text-slate-600">{d.student.program} · {d.student.year} · {d.student.student_code}</p>
          </div>
          {r && <Link to={`/report/${r.id}`} data-testid="open-student-report" className="h-11 px-5 rounded-xl bg-eq text-white text-sm font-medium inline-flex items-center gap-2 hover:bg-eq-dark"><FileText className="h-4 w-4" /> Open full report</Link>}
        </div>
        <Card testid="student-flags">
          <div className="flex flex-wrap items-center gap-3"><SevChip s={d.severity} testid="student-detail-sev" /><span className="text-sm text-slate-500">{d.flags.length ? "Why this student may need support:" : "No warning signs right now."}</span></div>
          {d.flags.length > 0 && <ul className="mt-3 grid sm:grid-cols-2 gap-2">{d.flags.map((f) => <li key={f} className="text-sm text-slate-700 flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{f}</li>)}</ul>}
        </Card>
        {!r ? <Card><p className="text-slate-500">This student hasn&apos;t completed a check-in yet.</p></Card> : (<>
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
            <Card title={`Assessment · overall ${r.overall}`} testid="student-scores">
              <p className="-mt-2 mb-3 text-xs text-slate-500">Taken {new Date(r.created_at).toLocaleDateString("en-IN")} · {r.path === 2 ? "Counsellor path recommended" : "Strengthening path"} · higher = less stress</p>
              <div className="space-y-2.5">{r.areas.map((a) => (
                <div key={a.key}><div className="flex justify-between text-sm"><span className="text-slate-700">{a.name}</span><span className={`font-mono text-xs ${a.score < 35 ? "text-rose-600 font-semibold" : a.score < 50 ? "text-amber-700" : "text-slate-500"}`}>{a.score} · {a.level}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-eq-bg overflow-hidden"><div className={`h-full ${a.score < 35 ? "bg-rose-400" : a.score < 50 ? "bg-amber-400" : "bg-eq"}`} style={{ width: `${a.score}%` }} /></div></div>
              ))}</div>
            </Card>
            <Card title="14-day progress" testid="student-progress">
              <div className="-mt-1 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-eq-bg p-3"><div className="font-serif text-2xl font-bold">{(r.logged_days || []).length}/14</div><div className="text-xs text-slate-500">check-ins</div></div>
                <div className="rounded-2xl bg-eq-bg p-3"><div className="font-serif text-2xl font-bold">{s1.pct}%</div><div className="text-xs text-slate-500">Week 1 activities</div></div>
                <div className="rounded-2xl bg-eq-bg p-3"><div className="font-serif text-2xl font-bold">{elapsedDays(r) >= 7 ? `${s2.pct}%` : "—"}</div><div className="text-xs text-slate-500">Week 2 activities</div></div>
              </div>
              <p className="mt-4 text-xs font-mono uppercase tracking-wider text-slate-400">Plan</p>
              <ol className="mt-1 space-y-1 text-sm text-slate-700">{r.plan.map((a, i) => <li key={a.id}><span className="font-mono text-xs text-slate-400 mr-2">{i + 1}</span>{a.name}</li>)}</ol>
            </Card>
          </div>
          <Card title="Daily record — mood, activities & feedback" testid="student-day-record"><DayTable r={r} /></Card>
        </>)}
        <Card title="Sessions" testid="student-bookings">
          {!d.bookings.length ? <p className="text-sm text-slate-500">No sessions booked or requested.</p> : <div className="space-y-4">{d.bookings.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="text-sm"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[b.status]}`}>{b.status}</span> <span className="ml-2 text-slate-700">{b.slot ? `${fmtDay(b.slot.start)}, ${fmtTime(b.slot.start)} · ${b.slot.mode}` : `Request · prefers ${b.preferred || "any time"}`}</span></div>
                <BookingActions b={b} slots={slots} onDone={load} />
              </div>
              {b.note && <p className="mt-2 text-sm italic text-slate-600">Student: &ldquo;{b.note}&rdquo;</p>}
              <div className="mt-3 flex gap-2">
                <textarea data-testid={`counsellor-note-${b.id}`} rows={2} maxLength={1000} placeholder="Private counsellor notes" value={notes[b.id] ?? b.counsellor_note ?? ""} onChange={(e) => setNotes({ ...notes, [b.id]: e.target.value })}
                  className="flex-1 rounded-xl border border-eq/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eq resize-none" />
                <button data-testid={`save-note-${b.id}`} onClick={() => saveNote(b)} className="self-end h-9 px-3 rounded-lg bg-eq-soft text-eq-dark text-xs font-medium">Save note</button>
              </div>
            </div>
          ))}</div>}
        </Card>
      </main>
    </div>
  );
}
