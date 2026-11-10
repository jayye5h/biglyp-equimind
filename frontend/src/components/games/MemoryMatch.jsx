import { useState } from "react";
import { RotateCcw, Sun, Moon, Leaf, Cloud, Heart, Star } from "lucide-react";

const ICONS = [Sun, Moon, Leaf, Cloud, Heart, Star];
const deal = () => [...ICONS.keys(), ...ICONS.keys()].map((k) => [Math.random(), k]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

export const MemoryMatch = () => {
  const [cards, setCards] = useState(deal);
  const [open, setOpen] = useState([]);
  const [found, setFound] = useState([]);
  const [moves, setMoves] = useState(0);
  const flip = (i) => {
    if (open.length === 2 || open.includes(i) || found.includes(cards[i])) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (cards[next[0]] === cards[next[1]]) {
        setFound((f) => [...f, cards[i]]);
        setOpen([]);
      } else setTimeout(() => setOpen([]), 800);
    }
  };
  const reset = () => {
    setCards(deal());
    setOpen([]);
    setFound([]);
    setMoves(0);
  };
  const done = found.length === ICONS.length;
  return (
    <div data-testid="game-memory" className="text-center">
      <p className="text-sm text-slate-500">Find all six pairs.</p>
      <div className="mt-4 mx-auto grid grid-cols-4 gap-2 w-64">
        {cards.map((k, i) => {
          const Icon = ICONS[k];
          const shown = open.includes(i) || found.includes(k);
          return (
            <button key={i} data-testid={`memory-card-${i}`} onClick={() => flip(i)}
              className={`h-16 rounded-xl grid place-items-center transition-colors duration-200 ${shown ? "bg-eq-soft" : "bg-eq hover:bg-eq-dark"}`}>
              {shown && <Icon className="h-7 w-7 text-eq-dark" />}
            </button>
          );
        })}
      </div>
      <p data-testid="memory-status" className="mt-4 text-sm font-medium text-slate-700">{done ? `All pairs found in ${moves} moves!` : `Moves: ${moves} · Pairs: ${found.length}/6`}</p>
      <button data-testid="memory-reset" onClick={reset} className="mt-2 text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> New game</button>
    </div>
  );
};
