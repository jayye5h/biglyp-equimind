import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ArrowRight, Grid3x3, Network, Wind, Brain, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sudoku } from "@/components/games/Sudoku";
import { ZeroKata } from "@/components/games/ZeroKata";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { ExercisePlayer } from "@/components/home/ExercisePlayer";

const ZK = () => <span className="font-serif font-bold text-lg">ZK</span>;
export const GAMES = [
  { id: "sudoku", name: "Mini Sudoku", icon: Grid3x3, C: Sudoku },
  { id: "zerokata", name: "Zero-Kata", icon: ZK, C: ZeroKata },
  { id: "memory", name: "Memory Match", icon: Network, C: MemoryMatch },
];
const GAME = Object.fromEntries(GAMES.map((g) => [g.id, g]));

const GameDialog = ({ g, onClose }) => {
  const Game = g?.C;
  return (
    <Dialog open={!!g} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent data-testid="game-dialog" className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-6">
        <DialogTitle className="font-serif text-2xl text-center">{g?.name}</DialogTitle>
        <DialogDescription className="sr-only">Brain game</DialogDescription>
        {Game && <Game />}
      </DialogContent>
    </Dialog>
  );
};

const Card = ({ testid, onClick, icon: Icon, eyebrow, tag, title, meta, why, cta }) => (
  <button data-testid={testid} onClick={onClick} className="group relative rounded-3xl border border-eq/10 bg-gradient-to-br from-eq-bg/70 to-white p-5 sm:p-6 text-left flex flex-col hover:border-eq/40 hover:shadow-[0_12px_32px_-16px_rgb(var(--eq-p)/0.45)] transition-[border-color,box-shadow]">
    <div className="flex items-start justify-between gap-3">
      <span className="h-14 w-14 shrink-0 rounded-2xl bg-white border border-eq/15 grid place-items-center text-eq"><Icon className="h-7 w-7" /></span>
      {tag && <span data-testid={`${testid}-tag`} className="rounded-full bg-eq text-white text-[11px] font-semibold px-3 py-1">{tag}</span>}
    </div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-eq">{eyebrow}</p>
    <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500 inline-flex items-center gap-1.5">{meta}</p>
    <p className="mt-3 text-sm text-slate-600 flex-1">{why}</p>
    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-eq-dark">{cta}<span className="h-8 w-8 rounded-full bg-white grid place-items-center group-hover:bg-eq transition-colors"><ArrowRight className="h-4 w-4 text-eq group-hover:text-white" /></span></span>
  </button>
);

export const ActivityOfDay = ({ plan }) => {
  const [g, setG] = useState(null);
  const [ex, setEx] = useState(null);
  if (!plan) return <div className="h-72 rounded-[2rem] bg-white/60 animate-pulse" />;
  const game = plan.game;
  return (
    <section data-testid="activity-of-day-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <h2 className="font-serif text-2xl font-bold text-slate-900">Activity of the Day</h2>
      <p className="mt-1 text-sm text-slate-600">{plan.personalised ? <>Two little things picked just for you{plan.mood_label ? <> — for a <span className="font-medium text-slate-800">{plan.mood_label.toLowerCase()}</span> day</> : null}, focused on <span className="font-medium text-slate-800">{plan.focus_areas[0].name}</span>.</> : "Two little things to lift your day. Your check-in will make these even more personal."}</p>
      <div className={`mt-5 grid gap-4 ${game ? "md:grid-cols-2" : ""}`}>
        <Card testid="activity-exercise-card" onClick={() => setEx(plan.exercise)} icon={Wind} eyebrow="Guided exercise" title={plan.exercise.name}
          meta={<><Clock className="h-3.5 w-3.5" /> About {plan.exercise.minutes} min</>} why={plan.exercise.why} cta="Begin now" />
        {game && <Card testid="activity-game-card" onClick={() => setG(GAME[game.id])} icon={GAME[game.id]?.icon || Brain} eyebrow="Brain game" tag={game.tag} title={game.name}
          meta={<><Brain className="h-3.5 w-3.5" /> {game.skill}</>} why={game.why} cta="Play now" />}
      </div>
      <Dialog open={!!ex} onOpenChange={(o) => { if (!o) setEx(null); }}>
        <DialogContent data-testid="exercise-dialog" className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-6">
          <DialogTitle className="font-serif text-2xl text-center">{ex?.name}</DialogTitle>
          <DialogDescription className="sr-only">Guided exercise</DialogDescription>
          {ex && <ExercisePlayer ex={ex} />}
        </DialogContent>
      </Dialog>
      <GameDialog g={g} onClose={() => setG(null)} />
    </section>
  );
};

export const MoreGames = () => {
  const [g, setG] = useState(null);
  const [on, setOn] = useState(null);
  useEffect(() => {
    api.get("/games/enabled").then((r) => setOn(r.data)).catch(() => setOn(GAMES.map((x) => x.id)));
  }, []);
  const list = GAMES.filter((x) => !on || on.includes(x.id));
  if (on && !list.length) return null;
  return (
    <section data-testid="more-games-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <div className="flex items-center gap-3"><h2 className="font-serif text-2xl font-bold text-slate-900">Brain Games</h2><span className="rounded-full bg-eq-soft text-eq-dark text-[11px] font-semibold px-3 py-1">Hustle for Your Brain</span></div>
      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        {list.map((x) => (
          <button key={x.id} data-testid={`game-card-${x.id}`} onClick={() => setG(x)} className="group rounded-2xl border border-eq/10 bg-eq-bg/50 p-4 flex items-center gap-4 text-left hover:border-eq/40 hover:shadow-md transition-[border-color,box-shadow]">
            <span className="h-14 w-14 shrink-0 rounded-xl border-2 border-eq/30 bg-white grid place-items-center text-eq"><x.icon className="h-7 w-7" /></span>
            <span className="flex-1 font-semibold text-slate-800">{x.name}</span>
            <span className="h-8 w-8 rounded-full bg-white grid place-items-center group-hover:bg-eq transition-colors"><ArrowRight className="h-4 w-4 text-eq group-hover:text-white" /></span>
          </button>
        ))}
      </div>
      <GameDialog g={g} onClose={() => setG(null)} />
    </section>
  );
};
