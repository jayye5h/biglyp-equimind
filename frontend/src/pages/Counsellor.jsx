import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarClock, Users, CalendarPlus, Trash2, ArrowRight, Inbox, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/Shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fmtDay, fmtTime, STATUS_TONE } from "@/components/home/CounsellorCard";

export const SEV = [
  { l: "No flags", c: "bg-slate-100 text-slate-600" },
  { l: "Monitor closely", c: "bg-amber-50 text-amber-800 border border-amber-200" },
  { l: "Needs attention", c: "bg-rose-50 text-rose-700 border border-rose-200" },
];
export const SevChip = ({ s, testid }) => <span data-testid={testid} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${SEV[s].c}`}>{SEV[s].l}</span>;

const StudentCell = ({ st, rep }) => (
  <div className="min-w-0">
    <Link to={`/counsellor/student/${st.id}`} className="font-semibold text-slate-900 hover:text-eq-dark">{st.name}</Link>
    <p className="text-xs text-slate-500 truncate">{[st.program, st.year, st.student_code].filter(Boolean).join(" · ")}</p>
    {rep && <p className="text-xs text-slate-500">Overall <b className="text-slate-800">{rep.overall}</b> · {rep.journey_over ? "Journey complete" : `Day ${rep.day} of 14`} · {rep.logged} check-ins</p>}
  </div>
);

const Empty = ({ icon: Icon, text }) => (
  <div className="rounded-[2rem] bg-white border border-eq/10 p-10 text-center text-slate-500"><Icon className="mx-auto h-8 w-8 text-eq/50" /><p className="mt-3">{text}</p></div>
);

export const BookingActions = ({ b, slots, onDone }) => {
  const [slot, setSlot] = useState("");
  const upd = async (body, msg) => {
    try { await api.patch(`/counsellor/bookings/${b.id}`, body); toast.success(msg); onDone(); } catch (e) { toast.error(errMsg(e)); }
  };
  if (b.status === "completed" || b.status === "cancelled") return null;
  const free = (slots || []).filter((s) => !s.booked_by && new Date(s.start) > new Date());
  return (
    <div className="flex flex-wrap items-center gap-2">
      {b.status === "pending" && (<>
        <select data-testid={`assign-slot-${b.id}`} value={slot} onChange={(e) => setSlot(e.target.value)} className="h-9 rounded-lg border border-eq/20 bg-white px-2 text-xs">
          <option value="">Pick a time…</option>
          {free.map((s) => <option key={s.id} value={s.id}>{fmtDay(s.start)}, {fmtTime(s.start)}</option>)}
        </select>
        <button data-testid={`confirm-booking-${b.id}`} disabled={!slot} onClick={() => upd({ slot_id: slot }, "Session confirmed")} className="h-9 px-3 rounded-lg bg-eq text-white text-xs font-medium disabled:opacity-40">Confirm</button>
      </>)}
      {b.status === "confirmed" && <button data-testid={`complete-booking-${b.id}`} onClick={() => upd({ status: "completed" }, "Marked as completed")} className="h-9 px-3 rounded-lg bg-eq-soft text-eq-dark text-xs font-medium inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Mark completed</button>}
      <button data-testid={`cancel-booking-${b.id}`} onClick={() => upd({ status: "cancelled" }, "Booking cancelled")} className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 text-xs inline-flex items-center gap-1 hover:text-rose-600"><XCircle className="h-3.5 w-3.5" /> Cancel</button>
    </div>
  );
};

const Sessions = ({ rows, slots, reload }) => {
  if (!rows) return <div className="h-60 rounded-[2rem] bg-white/60 animate-pulse" />;
  const open = rows.filter((b) => b.status === "pending" || b.status === "confirmed");
  const past = rows.filter((b) => !(b.status === "pending" || b.status === "confirmed"));
  if (!rows.length) return <Empty icon={Inbox} text="No bookings or requests yet." />;
  const Row = ({ b }) => (
    <div data-testid={`session-row-${b.id}`} className="p-5 grid lg:grid-cols-[1.2fr_1fr_1.3fr_auto] gap-4 items-start">
      <StudentCell st={b.student} rep={b.report} />
      <div className="text-sm">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[b.status]}`}>{b.kind === "request" && b.status === "pending" ? "Request — needs a time" : b.status[0].toUpperCase() + b.status.slice(1)}</span>
        <p className="mt-1.5 text-slate-700">{b.slot ? <><b>{fmtDay(b.slot.start)}, {fmtTime(b.slot.start)}</b><br /><span className="text-xs text-slate-500">{b.slot.mode}</span></> : <span className="text-xs text-slate-500">Prefers: {b.preferred || "any time"}</span>}</p>
      </div>
      <div className="text-sm text-slate-600">{b.note ? <p className="italic">&ldquo;{b.note}&rdquo;</p> : <p className="text-slate-400">No note</p>}
        {b.severity > 0 && <div className="mt-2"><SevChip s={b.severity} /><p className="mt-1 text-xs text-slate-500">{b.flags.slice(0, 2).join(" · ")}</p></div>}</div>
      <div className="flex flex-col items-start lg:items-end gap-2">
        <BookingActions b={b} slots={slots} onDone={reload} />
        <Link to={`/counsellor/student/${b.student.id}`} data-testid={`view-student-${b.student.id}`} className="text-sm text-eq hover:text-eq-dark inline-flex items-center gap-1">View record <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white border border-eq/10 divide-y divide-slate-100" data-testid="sessions-upcoming">
        <h2 className="px-5 pt-5 pb-3 font-serif text-xl font-bold">Upcoming & requests <span className="text-sm font-sans font-normal text-slate-500">({open.length})</span></h2>
        {open.length ? open.map((b) => <Row key={b.id} b={b} />) : <p className="p-5 text-sm text-slate-500">Nothing upcoming.</p>}
      </section>
      {past.length > 0 && <section className="rounded-[2rem] bg-white border border-eq/10 divide-y divide-slate-100 opacity-90" data-testid="sessions-past">
        <h2 className="px-5 pt-5 pb-3 font-serif text-xl font-bold">Past & cancelled</h2>
        {past.map((b) => <Row key={b.id} b={b} />)}
      </section>}
    </div>
  );
};

const StudentList = ({ rows, attentionOnly }) => {
  if (!rows) return <div className="h-60 rounded-[2rem] bg-white/60 animate-pulse" />;
  const list = attentionOnly ? rows.filter((r) => r.severity > 0) : rows;
  if (!list.length) return <Empty icon={Users} text={attentionOnly ? "No students need attention right now." : "No students yet."} />;
  return (
    <section className="rounded-[2rem] bg-white border border-eq/10 divide-y divide-slate-100" data-testid={attentionOnly ? "attention-list" : "students-list"}>
      {attentionOnly && <p className="px-5 py-4 text-sm text-slate-600 bg-rose-50/40 rounded-t-[2rem]">Students whose scores, moods, stress or check-in pattern suggest they may need a conversation — whether or not they&apos;ve asked for a session.</p>}
      {list.map((x) => (
        <div key={x.student.id} data-testid={`student-row-${x.student.id}`} className="p-5 grid md:grid-cols-[1.2fr_1.6fr_auto] gap-4 items-center">
          <StudentCell st={x.student} rep={x.report} />
          <div>
            <div className="flex flex-wrap gap-2"><SevChip s={x.severity} testid={`student-sev-${x.student.id}`} />{x.active_booking && <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[x.active_booking]}`}>{x.active_booking === "pending" ? "Requested session" : "Session booked"}</span>}{!x.report && <span className="text-xs text-slate-400">No check-in yet</span>}</div>
            {x.flags.length > 0 && <ul className="mt-2 space-y-0.5">{x.flags.map((f) => <li key={f} className="text-xs text-slate-600 flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />{f}</li>)}</ul>}
          </div>
          <Link to={`/counsellor/student/${x.student.id}`} className="text-sm text-eq hover:text-eq-dark inline-flex items-center gap-1">View record <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ))}
    </section>
  );
};

const Availability = ({ slots, reload }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [mode, setMode] = useState("In person · Wellness Centre");
  const add = async () => {
    try { await api.post("/counsellor/slots", { starts: [`${date}T${time}:00+05:30`], minutes: 30, mode }); toast.success("Slot added"); reload(); } catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (s) => { try { await api.delete(`/counsellor/slots/${s.id}`); toast("Slot removed"); reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-6" data-testid="add-slot-form">
        <h2 className="font-serif text-xl font-bold flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-eq" /> Add a free slot <span className="text-sm font-sans font-normal text-slate-500">(India time, 30 min)</span></h2>
        <div className="mt-4 flex flex-wrap gap-3 items-end">
          <label className="text-sm text-slate-600">Date<input data-testid="slot-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block h-10 rounded-lg border border-eq/20 px-2" /></label>
          <label className="text-sm text-slate-600">Time<input data-testid="slot-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block h-10 rounded-lg border border-eq/20 px-2" /></label>
          <label className="text-sm text-slate-600">Mode<select data-testid="slot-mode" value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 block h-10 rounded-lg border border-eq/20 px-2 bg-white"><option>In person · Wellness Centre</option><option>Online video call</option><option>Phone call</option></select></label>
          <button data-testid="add-slot-btn" disabled={!date || !time} onClick={add} className="h-10 px-5 rounded-lg bg-eq text-white text-sm font-medium disabled:opacity-40">Add slot</button>
        </div>
      </section>
      <section className="rounded-[2rem] bg-white border border-eq/10 divide-y divide-slate-100" data-testid="slots-list">
        <h2 className="px-5 pt-5 pb-3 font-serif text-xl font-bold">Your slots</h2>
        {!slots ? <div className="h-32 m-5 rounded-2xl bg-slate-50 animate-pulse" /> : !slots.length ? <p className="p-5 text-sm text-slate-500">No slots yet.</p> : slots.map((s) => (
          <div key={s.id} data-testid={`slot-row-${s.id}`} className="px-5 py-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="w-48 font-medium text-slate-800">{fmtDay(s.start)}, {fmtTime(s.start)}</span>
            <span className="flex-1 text-slate-500">{s.mode}</span>
            {s.booked_by ? <span className="rounded-full bg-eq-soft text-eq-dark px-2.5 py-0.5 text-xs font-semibold">Booked · {s.student_name}</span>
              : <button data-testid={`delete-slot-${s.id}`} onClick={() => del(s)} className="text-slate-400 hover:text-rose-600 inline-flex items-center gap-1 text-xs"><Trash2 className="h-3.5 w-3.5" /> Remove</button>}
          </div>
        ))}
      </section>
    </div>
  );
};

export default function Counsellor() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [students, setStudents] = useState(null);
  const [slots, setSlots] = useState(null);
  const load = useCallback(() => {
    api.get("/counsellor/sessions").then((r) => setSessions(r.data)).catch((e) => toast.error(errMsg(e)));
    api.get("/counsellor/students").then((r) => setStudents(r.data)).catch(() => {});
    api.get("/counsellor/slots").then((r) => setSlots(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  const att = (students || []).filter((s) => s.severity > 0).length;
  const openCount = (sessions || []).filter((b) => b.status === "pending" || b.status === "confirmed").length;
  return (
    <div className="min-h-screen bg-eq-bg">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <h1 data-testid="counsellor-title" className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Hello, {user?.name}</h1>
        <p className="mt-1 text-slate-600">Your students, sessions and availability — all in one calm place.</p>
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl">
          {[["Open sessions", openCount, CalendarClock], ["Need attention", att, AlertTriangle], ["Students", (students || []).length, Users]].map(([l, v, I]) => (
            <div key={l} className="rounded-2xl bg-white border border-eq/10 p-4"><I className="h-4 w-4 text-eq" /><div className="mt-2 font-serif text-2xl font-bold">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
          ))}
        </div>
        <Tabs defaultValue="sessions" className="mt-8">
          <TabsList className="bg-white border border-eq/10 h-auto p-1 rounded-2xl flex-wrap">
            <TabsTrigger data-testid="tab-sessions" value="sessions" className="rounded-xl">Sessions & requests</TabsTrigger>
            <TabsTrigger data-testid="tab-attention" value="attention" className="rounded-xl">Needs attention{att ? ` (${att})` : ""}</TabsTrigger>
            <TabsTrigger data-testid="tab-students" value="students" className="rounded-xl">All students</TabsTrigger>
            <TabsTrigger data-testid="tab-availability" value="availability" className="rounded-xl">My availability</TabsTrigger>
          </TabsList>
          <TabsContent value="sessions" className="mt-6"><Sessions rows={sessions} slots={slots} reload={load} /></TabsContent>
          <TabsContent value="attention" className="mt-6"><StudentList rows={students} attentionOnly /></TabsContent>
          <TabsContent value="students" className="mt-6"><StudentList rows={students} /></TabsContent>
          <TabsContent value="availability" className="mt-6"><Availability slots={slots} reload={load} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
