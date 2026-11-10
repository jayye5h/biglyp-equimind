import { useState } from "react";
import { ArrowRight, Grid3x3, Network } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sudoku } from "@/components/games/Sudoku";
import { ZeroKata } from "@/components/games/ZeroKata";
import { MemoryMatch } from "@/components/games/MemoryMatch";

const ZK = () => <span className="font-serif font-bold text-lg">ZK</span>;
const GAMES = [
  { id: "sudoku", name: "Sudoku", icon: Grid3x3, C: Sudoku },
  { id: "zerokata", name: "Zero-Kata", icon: ZK, C: ZeroKata },
  { id: "memory", name: "Memory Match", icon: Network, C: MemoryMatch },
];

export const ActivityOfDay = () => {
  const [g, setG] = useState(null);
  const pick = Math.floor(Date.now() / 864e5) % GAMES.length;
  const Game = g?.C;
  return (
    <section data-testid="activity-of-day-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <h2 className="font-serif text-2xl font-bold text-slate-900">Activity of the Day</h2>
      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        {GAMES.map((x, i) => (
          <button key={x.id} data-testid={`game-card-${x.id}`} onClick={() => setG(x)} className="group relative rounded-2xl border border-eq/10 bg-eq-bg/50 p-4 flex items-center gap-4 text-left hover:border-eq/40 hover:shadow-md transition-[border-color,box-shadow]">
            {i === pick && <span className="absolute -top-2.5 left-4 rounded-full bg-eq text-white text-[10px] font-semibold px-2.5 py-0.5">Today&apos;s pick</span>}
            <span className="h-14 w-14 shrink-0 rounded-xl border-2 border-eq/30 bg-white grid place-items-center text-eq"><x.icon className="h-7 w-7" /></span>
            <span className="flex-1 font-semibold text-slate-800">{x.name}</span>
            <span className="h-8 w-8 rounded-full bg-white grid place-items-center group-hover:bg-eq transition-colors"><ArrowRight className="h-4 w-4 text-eq group-hover:text-white" /></span>
          </button>
        ))}
      </div>
      <Dialog open={!!g} onOpenChange={(o) => { if (!o) setG(null); }}>
        <DialogContent data-testid="game-dialog" className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-6">
          <DialogTitle className="font-serif text-2xl text-center">{g?.name}</DialogTitle>
          {Game && <Game />}
        </DialogContent>
      </Dialog>
    </section>
  );
};
