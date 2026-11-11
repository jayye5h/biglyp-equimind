import { useCallback, useEffect, useMemo, useState } from "react";
import { HeartHandshake, CalendarClock, MapPin, X, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api, errMsg } from "@/lib/api";

const TZ = { timeZone: "Asia/Kolkata" };
export const fmtDay = (iso) => new Date(iso).toLocaleDateString("en-IN", { ...TZ, weekday: "short", day: "numeric", month: "short" });
export const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-IN", { ...TZ, hour: "numeric", minute: "2-digit" });
export const STATUS_TONE = { pending: "bg-amber-50 text-amber-800", confirmed: "bg-eq-soft text-eq-dark", completed: "bg-slate-100 text-slate-600", cancelled: "bg-rose-50 text-rose-700" };
const STATUS_L = { pending: "Request sent", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" };

const Consent = () => (
  <p data-testid="counsellor-visibility-note" className="flex gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-eq shrink-0" />Your campus counsellor can see your report, 14-day progress and daily feedback to prepare for your session and to support you.</p>
);

const BookDialog = ({ open, onClose, onBooked }) => {
  const [slots, setSlots] = useState(null);
  const [pick, setPick] = useState(null);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("slot");
  const [preferred, setPreferred] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setPick(null); setNote(""); setMode("slot"); setPreferred("");
    api.get("/counselling/slots").then((r) => setSlots(r.data)).catch(() => setSlots([]));
  }, [open]);
  const days = useMemo(() => {
    const g = {};
    (slots || []).forEach((s) => { (g[fmtDay(s.start)] ||= []).push(s); });
    return Object.entries(g);
  }, [slots]);
  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/counselling/bookings", mode === "slot" ? { slot_id: pick.id, note } : { note, preferred });
      toast.success(mode === "slot" ? "Your session is booked" : "Request sent to your counsellor", { description: mode === "slot" ? `${fmtDay(data.slot.start)}, ${fmtTime(data.slot.start)} · ${data.slot.mode}` : "They'll pick a time and confirm it with you." });
      onBooked();
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
      if (mode === "slot") api.get("/counselling/slots").then((r) => setSlots(r.data));
    } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent data-testid="booking-dialog" className="w-[calc(100%-1.5rem)] max-w-xl max-h-[92vh] overflow-y-auto rounded-[2rem] p-6 sm:p-8">
        <DialogTitle className="font-serif text-2xl">Talk to a counsellor</DialogTitle>
        <DialogDescription className="text-slate-600">Reaching out is a strong, brave step. Pick a time that suits you.</DialogDescription>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-eq-bg p-1">
          {[["slot", "Pick a time"], ["request", "Send a request"]].map(([k, l]) => (
            <button key={k} data-testid={`booking-mode-${k}`} onClick={() => setMode(k)} className={`h-10 rounded-xl text-sm font-medium transition-colors ${mode === k ? "bg-white shadow-sm text-eq-dark" : "text-slate-500"}`}>{l}</button>
          ))}
        </div>
        {mode === "slot" ? (
          <div className="mt-3 space-y-4">
            {slots === null ? <div className="h-32 rounded-2xl bg-slate-50 animate-pulse" /> : !slots.length ? (
              <p className="text-sm text-slate-600">No open times right now. Send a request instead and your counsellor will find a time for you.</p>
            ) : days.map(([day, list]) => (
              <div key={day}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{day}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {list.map((s) => (
                    <button key={s.id} data-testid={`slot-${s.id}`} onClick={() => setPick(s)} title={s.mode}
                      className={`h-10 px-4 rounded-xl text-sm border transition-colors ${pick?.id === s.id ? "bg-eq text-white border-eq" : "bg-white border-eq/25 text-slate-700 hover:border-eq/60"}`}>{fmtTime(s.start)}</button>
                  ))}
                </div>
              </div>
            ))}
            {pick && <p data-testid="slot-picked" className="text-sm text-slate-700 inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-eq" /> {fmtDay(pick.start)}, {fmtTime(pick.start)} · {pick.minutes} min · {pick.mode} · {pick.counsellor_name}</p>}
          </div>
        ) : (
          <label className="mt-3 block"><span className="text-sm text-slate-600">When usually suits you?</span>
            <input data-testid="booking-preferred" maxLength={120} value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder="e.g. Weekday evenings after 5 pm"
              className="mt-1 w-full h-11 rounded-xl border border-eq/20 px-3 text-sm outline-none focus:ring-2 focus:ring-eq" /></label>
        )}
        <label className="mt-3 block"><span className="text-sm text-slate-600">What would you like to talk about? <span className="text-slate-400">(optional)</span></span>
          <textarea data-testid="booking-note" maxLength={600} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Share as much or as little as you like"
            className="mt-1 w-full rounded-xl border border-eq/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eq resize-none" /></label>
        <div className="mt-3"><Consent /></div>
        <button data-testid="booking-submit-btn" disabled={busy || (mode === "slot" && !pick)} onClick={submit}
          className="mt-4 w-full h-12 rounded-2xl bg-eq text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-eq-dark disabled:opacity-40 transition-colors">
          {mode === "slot" ? <><CalendarClock className="h-4 w-4" /> Confirm booking</> : <><Send className="h-4 w-4" /> Send request</>}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export const CounsellorCard = () => {
  const [mine, setMine] = useState(null);
  const [open, setOpen] = useState(false);
  const load = useCallback(() => api.get("/counselling/my").then((r) => setMine(r.data)).catch(() => setMine([])), []);
  useEffect(() => { load(); }, [load]);
  const active = (mine || []).filter((b) => b.status === "pending" || b.status === "confirmed");
  const cancel = async (b) => {
    try { await api.post(`/counselling/bookings/${b.id}/cancel`); toast("Booking cancelled"); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <section data-testid="counsellor-card" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="h-14 w-14 shrink-0 rounded-2xl bg-violet-50 grid place-items-center"><HeartHandshake className="h-7 w-7 text-violet-600" /></span>
        <div className="flex-1">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Talk to a counsellor</h2>
          <p className="text-sm text-slate-600">A safe, confidential space to talk things through. You don&apos;t need a reason bigger than &ldquo;I&apos;d like to talk&rdquo;.</p>
        </div>
        {active.length < 2 && <button data-testid="book-session-btn" onClick={() => setOpen(true)} className="h-11 px-5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">Book a session</button>}
      </div>
      {active.length > 0 && (
        <div className="mt-5 space-y-2">
          {active.map((b) => (
            <div key={b.id} data-testid={`my-booking-${b.id}`} className="rounded-2xl bg-eq-bg/60 border border-eq/10 px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[b.status]}`}>{STATUS_L[b.status]}</span>
              <span className="flex-1 text-slate-700">{b.slot ? <><b>{fmtDay(b.slot.start)}, {fmtTime(b.slot.start)}</b> · {b.slot.mode} · {b.counsellor_name}</> : <>Waiting for {b.counsellor_name || "your counsellor"} to pick a time{b.preferred ? ` (you suggested: ${b.preferred})` : ""}</>}</span>
              <button data-testid={`cancel-booking-${b.id}`} onClick={() => cancel(b)} className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><X className="h-3.5 w-3.5" /> Cancel</button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4"><Consent /></div>
      <BookDialog open={open} onClose={() => setOpen(false)} onBooked={load} />
    </section>
  );
};
