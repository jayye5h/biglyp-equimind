import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ClipboardCheck, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const ago = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
};

/** Header bell: in-app notification inbox. `pending` (student) adds a "today's check-in" shortcut at the top. */
export const NotificationBell = ({ pending = null, onPending }) => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const load = useCallback(() => api.get("/notifications").then((r) => setItems(r.data)).catch(() => {}), []);
  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);
  const unread = items.filter((n) => !n.read).length;
  const onOpen = (o) => {
    setOpen(o);
    if (o) load();
    if (!o && unread) {
      api.post("/notifications/read-all").then(load).catch(() => {});
    }
  };
  const go = (n) => {
    setOpen(false);
    if (!n.url) return;
    const [path, hash] = n.url.split("#");
    nav(path + (hash ? `#${hash}` : ""));
  };
  return (
    <Popover open={open} onOpenChange={onOpen}>
      <PopoverTrigger data-testid="bell-btn" aria-label="Notifications" className="relative h-10 w-10 rounded-full hover:bg-white grid place-items-center transition-colors">
        <Bell className="h-5 w-5 text-slate-700" />
        {unread > 0 ? (
          <span data-testid="bell-count" className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f07167] text-white text-[10px] font-bold grid place-items-center ring-2 ring-white">{unread > 9 ? "9+" : unread}</span>
        ) : pending !== null && pending !== undefined ? (
          <span data-testid="bell-dot" className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-eq ring-2 ring-white" />
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(360px,calc(100vw-2rem))] p-0 rounded-2xl overflow-hidden" data-testid="notif-inbox">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-900 text-sm">Notifications</p>
          {unread > 0 && <span className="text-xs text-slate-500">{unread} new</span>}
        </div>
        {pending !== null && pending !== undefined && onPending && (
          <button data-testid="notif-pending-checkin" onClick={() => { setOpen(false); onPending(); }} className="w-full text-left px-4 py-3 bg-eq-soft flex gap-3 items-start hover:bg-eq-soft/70">
            <ClipboardCheck className="h-5 w-5 text-eq-dark shrink-0 mt-0.5" />
            <span><span className="block text-sm font-semibold text-slate-900">Day {pending + 1} check-in is waiting</span><span className="block text-xs text-slate-600">Tap to log today's mood and activities.</span></span>
          </button>
        )}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {items.length === 0 ? (
            <div data-testid="notif-empty" className="px-4 py-8 text-center text-sm text-slate-500"><Inbox className="h-6 w-6 mx-auto mb-2 text-slate-300" />No notifications yet</div>
          ) : items.map((n, i) => (
            <button key={n.id || i} data-testid={`notif-item-${i}`} onClick={() => go(n)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-3 ${n.read ? "" : "bg-amber-50/40"}`}>
              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.read ? "bg-transparent" : "bg-eq"}`} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900">{n.title}</span>
                <span className="block text-xs text-slate-600 mt-0.5">{n.body}</span>
                <span className="block text-[11px] text-slate-400 mt-1">{ago(n.created_at)}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
