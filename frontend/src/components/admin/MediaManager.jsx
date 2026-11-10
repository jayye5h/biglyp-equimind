import { useEffect, useState } from "react";
import { Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "@/lib/api";
import { thumb } from "@/components/home/MediaSections";

const KINDS = [["short", "Calm Shorts"], ["audiobook", "Audiobooks"], ["video", "Videos"]];
const blank = { kind: "short", title: "", duration: "", url: "" };

const Row = ({ m, onSaved, onDeleted }) => {
  const [f, setF] = useState({ kind: m.kind, title: m.title, duration: m.duration, url: `https://www.youtube.com/watch?v=${m.youtube_id}` });
  const save = () => api.put(`/admin/media/${m.id}`, f).then((r) => { onSaved(r.data); toast.success("Saved"); }).catch((e) => toast.error(errMsg(e)));
  const del = () => api.delete(`/admin/media/${m.id}`).then(() => { onDeleted(m.id); toast.success("Removed"); }).catch((e) => toast.error(errMsg(e)));
  const inp = "h-9 rounded-lg bg-eq-bg px-3 text-sm outline-none focus:ring-2 focus:ring-eq min-w-0";
  return (
    <div data-testid={`media-admin-row-${m.id}`} className="py-3 grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr_auto] gap-3 items-center">
      <img src={thumb(m.youtube_id)} alt="" className="h-12 w-16 sm:w-20 rounded-lg object-cover" />
      <div className="grid sm:grid-cols-[1.4fr_0.6fr_1.6fr] gap-2">
        <input className={inp} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid={`media-title-${m.id}`} />
        <input className={inp} value={f.duration} placeholder="e.g. 10 min" onChange={(e) => setF({ ...f, duration: e.target.value })} />
        <input className={inp} value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} data-testid={`media-url-${m.id}`} />
      </div>
      <div className="col-span-2 sm:col-span-1 flex gap-2 justify-end">
        <button data-testid={`media-save-${m.id}`} onClick={save} className="h-9 px-3 rounded-lg bg-eq text-white text-sm inline-flex items-center gap-1"><Save className="h-4 w-4" /> Save</button>
        <button data-testid={`media-delete-${m.id}`} onClick={del} className="h-9 w-9 rounded-lg border border-slate-200 grid place-items-center text-slate-500 hover:text-[#c2410c]"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export const MediaManager = () => {
  const [items, setItems] = useState(null);
  const [n, setN] = useState(blank);
  useEffect(() => {
    api.get("/media").then((r) => setItems(r.data));
  }, []);
  const add = () => api.post("/admin/media", n).then((r) => { setItems([...items, r.data]); setN({ ...blank, kind: n.kind }); toast.success("Added"); }).catch((e) => toast.error(errMsg(e)));
  if (!items) return <div className="h-60 rounded-2xl bg-white/60 animate-pulse" />;
  const inp = "h-10 rounded-xl bg-eq-bg px-3 text-sm outline-none focus:ring-2 focus:ring-eq min-w-0";
  return (
    <div className="space-y-6">
      <div data-testid="media-add-form" className="rounded-2xl bg-white border border-eq/10 p-5 grid sm:grid-cols-[140px_1.2fr_0.6fr_1.6fr_auto] gap-2">
        <select data-testid="media-new-kind" className={inp} value={n.kind} onChange={(e) => setN({ ...n, kind: e.target.value })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input data-testid="media-new-title" className={inp} placeholder="Title" value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} />
        <input data-testid="media-new-duration" className={inp} placeholder="Duration" value={n.duration} onChange={(e) => setN({ ...n, duration: e.target.value })} />
        <input data-testid="media-new-url" className={inp} placeholder="YouTube link" value={n.url} onChange={(e) => setN({ ...n, url: e.target.value })} />
        <button data-testid="media-add-btn" onClick={add} className="h-10 px-4 rounded-xl bg-eq text-white text-sm inline-flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {KINDS.map(([k, l]) => (
        <div key={k} className="rounded-2xl bg-white border border-eq/10 p-5">
          <h3 className="font-serif text-xl font-semibold">{l}</h3>
          <div className="mt-2 divide-y divide-slate-100">
            {items.filter((m) => m.kind === k).map((m) => (
              <Row key={m.id} m={m} onSaved={(u) => setItems(items.map((x) => (x.id === u.id ? u : x)))} onDeleted={(id) => setItems(items.filter((x) => x.id !== id))} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
