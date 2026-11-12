import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Info, Loader2, Volume2, Square } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SOUNDS, RELAX_BG } from "@/lib/sounds";

const Bars = () => (
  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-end gap-[2px] h-3" aria-hidden>
    <style>{"@keyframes eqbar{0%,100%{height:30%}50%{height:100%}}"}</style>
    {[0, 0.2, 0.4].map((d) => <span key={d} className="w-[3px] rounded-sm bg-white" style={{ animation: `eqbar 0.9s ease-in-out ${d}s infinite` }} />)}
  </span>
);

/** "Relax and Unwind" — tap any sound to play / pause it. Several can be mixed, each with its own volume. */
export const RelaxUnwind = () => {
  const audio = useRef({});
  const [on, setOn] = useState({}); // id -> "loading" | "playing"
  const [vol, setVol] = useState(() => Object.fromEntries(SOUNDS.map((s) => [s.id, 50])));
  const [info, setInfo] = useState(null);

  useEffect(() => () => Object.values(audio.current).forEach((a) => { a.pause(); a.src = ""; }), []);

  const toggle = (s) => {
    let a = audio.current[s.id];
    if (on[s.id]) {
      a?.pause();
      setOn(({ [s.id]: _, ...rest }) => rest);
      toast(`${s.name} paused`);
      return;
    }
    if (!a) {
      a = new Audio(s.audio);
      a.loop = true;
      a.preload = "auto";
      a.addEventListener("playing", () => setOn((o) => (o[s.id] ? { ...o, [s.id]: "playing" } : o)));
      a.addEventListener("waiting", () => setOn((o) => (o[s.id] ? { ...o, [s.id]: "loading" } : o)));
      audio.current[s.id] = a;
    }
    a.volume = vol[s.id] / 100;
    setOn((o) => ({ ...o, [s.id]: "loading" }));
    a.play().then(() => toast(`${s.name} playing`)).catch(() => {
      setOn(({ [s.id]: _, ...rest }) => rest);
      toast.error(`Couldn't play ${s.name} — please try again`);
    });
  };
  const setVolume = (id, v) => {
    setVol((x) => ({ ...x, [id]: v }));
    if (audio.current[id]) audio.current[id].volume = v / 100;
  };
  const stopAll = () => {
    Object.values(audio.current).forEach((a) => a.pause());
    setOn({});
  };
  const playing = Object.keys(on).length;

  return (
    <section data-testid="relax-unwind-section">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Relax and Unwind</h2>
          <p className="mt-1 text-sm text-slate-600">Soothing sounds to calm your mind. Tap any sound to play it — mix a few together if you like.</p>
        </div>
        {playing > 0 && (
          <button data-testid="relax-stop-all" onClick={stopAll} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold px-4 py-2 hover:bg-slate-700">
            <Square className="h-3 w-3 fill-white" /> Stop all ({playing})
          </button>
        )}
      </div>
      <div className="mt-5 relative rounded-[2rem] overflow-hidden bg-slate-700 bg-cover bg-center p-3 sm:p-8 lg:p-10" style={{ backgroundImage: `url(${RELAX_BG})` }}>
        <div className="rounded-[1.5rem] bg-white/20 backdrop-blur-[3px] border border-white/20 p-3 sm:p-8">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-6 lg:gap-8">
            {SOUNDS.map((s) => {
              const st = on[s.id];
              return (
                <div key={s.id} data-testid={`sound-${s.id}`} data-playing={!!st}
                  className={`group relative aspect-square rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all ${st ? "ring-2 ring-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] bg-[rgba(150,140,135,0.5)]" : "bg-[rgba(190,182,178,0.42)] hover:bg-[rgba(170,162,158,0.5)]"}`}>
                  <button data-testid={`sound-play-${s.id}`} onClick={() => toggle(s)} aria-pressed={!!st} aria-label={`${st ? "Pause" : "Play"} ${s.name}`}
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 sm:gap-3 text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.45))] ${st ? "pb-4 sm:pb-6" : ""}`}>
                    <s.icon className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 drop-shadow" />
                    <span className="text-[11px] sm:text-sm lg:text-base font-medium drop-shadow">{s.name}</span>
                  </button>
                  <button data-testid={`sound-info-${s.id}`} onClick={() => setInfo(s)} aria-label={`About ${s.name}`}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-6 w-6 grid place-items-center rounded-full text-white/70 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity">
                    <Info className="h-4 w-4" />
                  </button>
                  {st === "loading" && <Loader2 data-testid={`sound-loading-${s.id}`} className="absolute top-2 left-2 h-4 w-4 text-white animate-spin" />}
                  {st === "playing" && <Bars />}
                  {st && (
                    <label className="absolute bottom-1.5 sm:bottom-3 left-1/2 -translate-x-1/2 w-[62%] flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Volume2 className="hidden sm:block h-3 w-3 text-white shrink-0" />
                      <input data-testid={`sound-volume-${s.id}`} type="range" min="0" max="100" value={vol[s.id]} onChange={(e) => setVolume(s.id, Number(e.target.value))}
                        aria-label={`${s.name} volume`} className="w-full h-1 accent-white cursor-pointer" />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Sounds adapted from MindMelo (open source).</p>

      <Dialog open={!!info} onOpenChange={(o) => { if (!o) setInfo(null); }}>
        <DialogContent data-testid="sound-info-dialog" className="w-[calc(100%-2rem)] max-w-2xl rounded-3xl p-6 max-h-[92vh] overflow-y-auto">
          <DialogTitle className="font-serif text-2xl pr-6">{info?.title}</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">By: {info?.source}</DialogDescription>
          <p className="text-sm text-slate-700 leading-relaxed">{info?.desc}</p>
          <div className="flex flex-wrap gap-1.5">{info?.tags.map((t) => <span key={t} className="rounded-full bg-eq-soft text-eq-dark px-3 py-1 text-xs font-medium">{t}</span>)}</div>
          {info && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
              <iframe data-testid="sound-info-video" className="h-full w-full" src={info.link} title={info.title} frameBorder="0" loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
