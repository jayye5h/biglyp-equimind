import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, BellRing, Send, RefreshCw, Users, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

const CH = [
  { k: "email", label: "Email", icon: Mail },
  { k: "sms", label: "SMS", icon: MessageSquare },
  { k: "app", label: "App", icon: BellRing },
];
const STATUS = {
  sent: ["Sent", "bg-emerald-50 text-emerald-700"],
  demo: ["Demo (logged)", "bg-sky-50 text-sky-700"],
  off: ["Turned off", "bg-slate-100 text-slate-500"],
  no_contact: ["No contact", "bg-amber-50 text-amber-700"],
  not_connected: ["Email not connected", "bg-amber-50 text-amber-700"],
  failed: ["Failed", "bg-rose-50 text-rose-700"],
};
const when = (iso) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const Provider = ({ icon: Icon, title, ok, line, testid }) => (
  <div data-testid={testid} className="rounded-2xl bg-white border border-eq/10 p-4 flex gap-3">
    <span className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}><Icon className="h-5 w-5" /></span>
    <div className="min-w-0"><p className="font-semibold text-slate-900 text-sm">{title}</p><p className="text-xs text-slate-500 mt-0.5">{line}</p></div>
  </div>
);

export const NotificationsManager = () => {
  const [data, setData] = useState(null);
  const [logRows, setLogRows] = useState([]);
  const [fEvent, setFEvent] = useState("");
  const [fCh, setFCh] = useState("");
  const [testing, setTesting] = useState(null);
  const load = useCallback(() => api.get("/admin/notifications").then((r) => setData(r.data)).catch(() => toast.error("Couldn't load notifications")), []);
  const loadLog = useCallback(() => {
    const q = new URLSearchParams({ limit: "100", ...(fEvent && { event: fEvent }), ...(fCh && { channel: fCh }) });
    return api.get(`/admin/notifications/log?${q}`).then((r) => setLogRows(r.data)).catch(() => {});
  }, [fEvent, fCh]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadLog(); }, [loadLog]);

  const toggle = async (eid, ch, v) => {
    setData((d) => ({ ...d, events: d.events.map((e) => (e.id === eid ? { ...e, channels: { ...e.channels, [ch]: v } } : e)) }));
    try {
      await api.put(`/admin/notifications/${eid}`, { [ch]: v });
    } catch {
      toast.error("Couldn't save — please try again");
      load();
    }
  };
  const test = async (e) => {
    setTesting(e.id);
    try {
      const r = await api.post(`/admin/notifications/${e.id}/test`);
      const res = r.data.result || {};
      toast.success(`Test sent: ${e.name}`, { description: CH.map((c) => `${c.label}: ${(STATUS[res[c.k]] || [res[c.k]])[0]}`).join(" · ") });
      loadLog();
      load();
    } catch {
      toast.error("Test failed");
    } finally {
      setTesting(null);
    }
  };
  if (!data) return <div className="h-60 rounded-2xl bg-white/60 animate-pulse" />;
  const p = data.providers;
  const names = Object.fromEntries(data.events.map((e) => [e.id, e.name]));
  return (
    <div data-testid="notifications-manager" className="space-y-6">
      <div className="grid md:grid-cols-3 gap-3">
        <Provider testid="provider-email" icon={Mail} title="Email · Resend" ok={p.email.connected}
          line={p.email.connected ? `Connected · sending from ${p.email.from}` : "Not connected yet — add your Resend API key to start sending. Until then emails are logged as “not connected”."} />
        <Provider testid="provider-sms" icon={MessageSquare} title="SMS · Demo mode" ok={false} line="Texts are not really sent — each one is logged below so you can see exactly what would go out." />
        <Provider testid="provider-app" icon={BellRing} title="App notifications" ok line={`In-app inbox (bell icon) + browser push · ${p.app.devices} device${p.app.devices === 1 ? "" : "s"} subscribed`} />
      </div>

      <div className="rounded-2xl bg-white border border-eq/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-eq/10">
          <h3 className="font-serif text-xl font-bold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-500 mt-0.5">Switch each channel on or off for every notification. Changes apply to all users immediately.</p>
        </div>
        <div className="divide-y divide-eq/10">
          {data.events.map((e) => (
            <div key={e.id} data-testid={`notif-row-${e.id}`} className="px-5 py-4 grid lg:grid-cols-[1fr_auto_auto] gap-4 items-center">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{e.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{e.when}</p>
                <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-3"><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {e.audience}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {e.last_sent ? `Last sent ${when(e.last_sent)}` : "Not sent yet"}</span></p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {CH.map((c) => (
                  <label key={c.k} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${e.channels[c.k] ? "border-eq/30 bg-eq-soft text-eq-dark" : "border-slate-200 text-slate-400"}`}>
                    <c.icon className="h-3.5 w-3.5" />{c.label}
                    <Switch data-testid={`notif-toggle-${e.id}-${c.k}`} checked={e.channels[c.k]} onCheckedChange={(v) => toggle(e.id, c.k, v)} />
                  </label>
                ))}
              </div>
              <button data-testid={`notif-test-${e.id}`} onClick={() => test(e)} disabled={testing === e.id}
                className="justify-self-start lg:justify-self-end inline-flex items-center gap-1.5 rounded-full border border-eq/30 px-3.5 py-1.5 text-xs font-semibold text-eq-dark hover:bg-eq-soft disabled:opacity-50">
                <Send className="h-3.5 w-3.5" /> {testing === e.id ? "Sending…" : "Send test to me"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div data-testid="notif-log" className="rounded-2xl bg-white border border-eq/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-eq/10 flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-xl font-bold text-slate-900 mr-auto">Delivery log</h3>
          <select data-testid="notif-log-event" value={fEvent} onChange={(e) => setFEvent(e.target.value)} className="rounded-full border border-eq/15 bg-white px-3 py-1.5 text-xs text-slate-600">
            <option value="">All notifications</option>
            {data.events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select data-testid="notif-log-channel" value={fCh} onChange={(e) => setFCh(e.target.value)} className="rounded-full border border-eq/15 bg-white px-3 py-1.5 text-xs text-slate-600">
            <option value="">All channels</option>
            {CH.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}
          </select>
          <button data-testid="notif-log-refresh" onClick={loadLog} className="h-8 w-8 rounded-full border border-eq/15 grid place-items-center text-slate-500 hover:bg-eq-soft" aria-label="Refresh"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
        {logRows.length === 0 ? <p data-testid="notif-log-empty" className="px-5 py-8 text-center text-sm text-slate-500">Nothing sent yet. Use “Send test to me” to try a notification.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 text-left">
                <tr><th className="px-5 py-2 font-medium">When</th><th className="px-3 py-2 font-medium">Notification</th><th className="px-3 py-2 font-medium">To</th><th className="px-3 py-2 font-medium">Channel</th><th className="px-3 py-2 font-medium">Status</th><th className="px-5 py-2 font-medium">Message</th></tr>
              </thead>
              <tbody className="divide-y divide-eq/5">
                {logRows.map((l) => {
                  const [lab, cls] = STATUS[l.status] || [l.status, "bg-slate-100 text-slate-600"];
                  return (
                    <tr key={l.id} data-testid={`notif-log-row-${l.id}`} className="align-top">
                      <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">{when(l.created_at)}</td>
                      <td className="px-3 py-3 text-xs text-slate-700">{names[l.event] || l.event}{l.test && <span className="ml-1 rounded bg-slate-100 px-1 text-[10px] text-slate-500">test</span>}</td>
                      <td className="px-3 py-3 text-xs"><span className="font-medium text-slate-800">{l.user_name}</span><span className="block text-slate-400">{l.to || "—"}</span></td>
                      <td className="px-3 py-3 text-xs capitalize text-slate-600">{l.channel === "sms" ? "SMS" : l.channel}</td>
                      <td className="px-3 py-3"><span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{lab}</span>{l.detail && <span className="block mt-1 text-[10px] text-slate-400">{l.detail}</span>}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 min-w-[220px]"><b className="text-slate-800">{l.title}</b><span className="block">{l.body}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
