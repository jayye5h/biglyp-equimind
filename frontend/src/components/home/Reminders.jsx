import { useEffect, useState } from "react";
import { BellRing, BellOff, X } from "lucide-react";
import { toast } from "sonner";
import { pushState, enablePush, disablePush } from "@/lib/push";
import { useBrand } from "@/lib/theme";

const KEY = "eq_reminder_banner_hidden";

export const RemindersCard = () => {
  const B = useBrand();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(() => localStorage.getItem(KEY) === "1");
  useEffect(() => { pushState().then(setState).catch(() => setState("unsupported")); }, []);
  if (!state || hidden) return null;

  const turnOn = async () => {
    setBusy(true);
    try {
      const s = await enablePush();
      setState(s);
      if (s === "on") toast.success("Daily reminders are on", { description: "We'll nudge you at 10 am, 4 pm and 8 pm until your check-in is done." });
      else if (s === "denied") toast.error("Notifications are blocked", { description: "Allow notifications for this site in your browser settings, then try again." });
      else toast.error("This browser doesn't support notifications", { description: `Open ${B.name} in Chrome, Edge, Firefox or Safari (added to Home Screen) to get reminders.` });
    } catch (e) {
      toast.error("Could not turn on reminders. Please open the app in its own browser tab and try again.");
    } finally {
      setBusy(false);
    }
  };
  const turnOff = async () => { setBusy(true); setState(await disablePush()); setBusy(false); toast("Reminders turned off"); };
  const hide = () => { localStorage.setItem(KEY, "1"); setHidden(true); };

  if (state === "on") return (
    <div data-testid="reminders-on" className="rounded-2xl bg-white border border-eq/10 px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
      <BellRing className="h-4 w-4 text-eq shrink-0" /><span className="flex-1">Daily reminders are on — 10 am, 4 pm and 8 pm, until your check-in is done.</span>
      <button data-testid="reminders-off-btn" disabled={busy} onClick={turnOff} className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"><BellOff className="h-3.5 w-3.5" /> Turn off</button>
    </div>
  );
  return (
    <div data-testid="reminders-card" className="relative rounded-[2rem] bg-gradient-to-r from-eq-soft to-white border border-eq/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="h-12 w-12 shrink-0 rounded-2xl bg-white border border-eq/15 grid place-items-center"><BellRing className="h-6 w-6 text-eq" /></span>
      <div className="flex-1">
        <h3 className="font-serif text-xl font-bold text-slate-900">Never miss your daily check-in</h3>
        <p className="text-sm text-slate-600">{state === "unsupported" ? `Open ${B.name} in its own browser tab (Chrome, Edge, Firefox, or Safari added to Home Screen) to get gentle reminders.` : state === "denied" ? "Notifications are blocked for this site. Allow them in your browser settings to get gentle reminders." : "Get a gentle nudge at 10 am, 4 pm and 8 pm — only on days your check-in isn't done yet."}</p>
      </div>
      {state === "off" && <button data-testid="reminders-enable-btn" disabled={busy} onClick={turnOn} className="h-11 px-5 rounded-xl bg-eq text-white text-sm font-medium hover:bg-eq-dark disabled:opacity-50 transition-colors">{busy ? "Turning on…" : "Turn on reminders"}</button>}
      <button data-testid="reminders-hide-btn" onClick={hide} aria-label="Hide" className="absolute top-3 right-3 h-7 w-7 grid place-items-center rounded-full text-slate-400 hover:bg-white"><X className="h-4 w-4" /></button>
    </div>
  );
};
