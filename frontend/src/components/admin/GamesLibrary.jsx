import { useEffect, useMemo, useState } from "react";
import { Play, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { api, AREA_COLORS } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GAME_COMPONENTS } from "@/components/games/registry";

const AREAS = { A: "Academic & Workload", B: "Body & Sleep", C: "Emotional Load & Coping", D: "Social & Belonging", E: "Identity & Self-worth", F: "Family, Money & Future" };
const MOODS = ["Struggling", "Rough", "Mixed", "Strong", "Bright"];
const TYPES = ["All", "Calm", "Focus", "Mood lift", "Playful"];
const TYPE_STYLE = { Calm: "bg-sky-50 text-sky-700", Focus: "bg-indigo-50 text-indigo-700", "Mood lift": "bg-amber-50 text-amber-700", Playful: "bg-rose-50 text-rose-700" };

const Chip = ({ on, onClick, children, testid }) => (
  <button data-testid={testid} onClick={onClick} className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${on ? "bg-eq text-white border-eq" : "bg-white border-eq/15 text-slate-600 hover:border-eq/40"}`}>{children}</button>
);

export const GamesLibrary = () => {
  const [games, setGames] = useState(null);
  const [type, setType] = useState("All");
  const [area, setArea] = useState("all");
  const [mood, setMood] = useState("all");
  const [play, setPlay] = useState(null);
  useEffect(() => {
    api.get("/admin/games").then((r) => setGames(r.data));
  }, []);
  const list = useMemo(() => (games || []).filter((g) => (type === "All" || g.type === type) && (area === "all" || g.areas.includes(area)) && (mood === "all" || g.moods.includes(Number(mood)))), [games, type, area, mood]);
  const toggle = async (g, enabled) => {
    setGames((gs) => gs.map((x) => (x.id === g.id ? { ...x, enabled } : x)));
    try {
      await api.patch(`/admin/games/${g.id}`, { enabled });
      toast.success(`${g.name} turned ${enabled ? "on" : "off"}`);
    } catch {
      setGames((gs) => gs.map((x) => (x.id === g.id ? { ...x, enabled: !enabled } : x)));
      toast.error("Couldn't save — please try again");
    }
  };
  if (!games) return <div className="h-60 rounded-2xl bg-white/60 animate-pulse" />;
  const Game = play && GAME_COMPONENTS[play.id];
  const off = games.filter((g) => !g.enabled).length;
  return (
    <div data-testid="games-library" className="space-y-5">
      <div className="rounded-2xl bg-white border border-eq/10 p-5 flex flex-wrap items-center justify-between gap-3">
        <p data-testid="games-summary" className="text-sm text-slate-600"><b className="text-slate-900">{games.length} games</b> · {games.filter((g) => g.student).length} live for students · {off} turned off</p>
        <p className="text-xs text-slate-400">Play any game to preview it. Students only see games marked “Live for students” that are turned on.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => <Chip key={t} testid={`games-type-${t.toLowerCase().replace(" ", "-")}`} on={type === t} onClick={() => setType(t)}>{t}</Chip>)}
        <select data-testid="games-area-filter" value={area} onChange={(e) => setArea(e.target.value)} className="ml-auto rounded-full border border-eq/15 bg-white px-3 py-1.5 text-xs text-slate-600">
          <option value="all">All life areas</option>
          {Object.entries(AREAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select data-testid="games-mood-filter" value={mood} onChange={(e) => setMood(e.target.value)} className="rounded-full border border-eq/15 bg-white px-3 py-1.5 text-xs text-slate-600">
          <option value="all">Any mood</option>
          {MOODS.map((m, i) => <option key={m} value={i}>Good on {m.toLowerCase()} days</option>)}
        </select>
      </div>
      <p data-testid="games-count" className="text-xs text-slate-500">Showing {list.length} of {games.length}</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((g) => (
          <div key={g.id} data-testid={`game-lib-card-${g.id}`} className={`rounded-2xl bg-white border border-eq/10 p-5 flex flex-col transition-opacity ${g.enabled ? "" : "opacity-60"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLE[g.type]}`}>{g.type}</span>
              <label className="inline-flex items-center gap-2 text-[11px] text-slate-500">{g.enabled ? "On" : "Off"}
                <Switch data-testid={`game-toggle-${g.id}`} checked={g.enabled} onCheckedChange={(v) => toggle(g, v)} />
              </label>
            </div>
            <h4 className="mt-3 font-serif text-lg font-bold text-slate-900">{g.name}</h4>
            <p className="mt-0.5 text-xs text-slate-500 inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {g.minutes} min · {g.skill}</p>
            {g.student && <span data-testid={`game-live-${g.id}`} className="mt-2 self-start inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold"><Users className="h-3 w-3" /> Live for students</span>}
            <p className="mt-3 text-sm text-slate-600 flex-1">{g.why}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {g.areas.map((a) => <span key={a} className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: AREA_COLORS[a] }}>{AREAS[a]}</span>)}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Good on: {g.moods.map((m) => MOODS[m]).join(", ")} days</p>
            <button data-testid={`game-play-${g.id}`} onClick={() => setPlay(g)} className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-eq text-white text-sm font-semibold py-2 hover:bg-eq-dark">
              <Play className="h-4 w-4" /> Play
            </button>
          </div>
        ))}
      </div>
      <Dialog open={!!play} onOpenChange={(o) => { if (!o) setPlay(null); }}>
        <DialogContent data-testid="admin-game-dialog" className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-6 max-h-[92vh] overflow-y-auto">
          <DialogTitle className="font-serif text-2xl text-center">{play?.name}</DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500">{play?.how}</DialogDescription>
          {Game && <Game key={play.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
