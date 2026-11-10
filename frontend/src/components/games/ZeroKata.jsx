import { useState } from "react";
import { RotateCcw, X, Circle } from "lucide-react";

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b) => {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? "draw" : null;
};

const aiMove = (b) => {
  const empty = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  for (const who of ["O", "X"]) {
    for (const i of empty) {
      const t = [...b];
      t[i] = who;
      if (winner(t) === who) return i;
    }
  }
  if (!b[4]) return 4;
  return empty[Math.floor(Math.random() * empty.length)];
};

export const ZeroKata = () => {
  const [b, setB] = useState(Array(9).fill(null));
  const w = winner(b);
  const play = (i) => {
    if (b[i] || w) return;
    const n = [...b];
    n[i] = "X";
    if (!winner(n)) n[aiMove(n)] = "O";
    setB(n);
  };
  return (
    <div data-testid="game-zerokata" className="text-center">
      <p className="text-sm text-slate-500">You are X. Get three in a row before the computer.</p>
      <div className="mt-4 mx-auto grid grid-cols-3 gap-2 w-60">
        {b.map((v, i) => (
          <button key={i} data-testid={`zk-cell-${i}`} onClick={() => play(i)} className="h-20 rounded-2xl bg-eq-bg hover:bg-eq-soft grid place-items-center transition-colors">
            {v === "X" && <X className="h-10 w-10 text-eq" strokeWidth={2.5} />}
            {v === "O" && <Circle className="h-9 w-9 text-[#f07167]" strokeWidth={2.5} />}
          </button>
        ))}
      </div>
      <p data-testid="zk-status" className="mt-4 text-sm font-medium text-slate-700">{w === "X" ? "You win! Calm and clever." : w === "O" ? "The computer got this one. Try again?" : w === "draw" ? "A draw — well matched." : "Your move."}</p>
      <button data-testid="zk-reset" onClick={() => setB(Array(9).fill(null))} className="mt-2 text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> New game</button>
    </div>
  );
};
