import { useState } from "react";
import { RotateCcw } from "lucide-react";

const BASE = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

const makePuzzle = () => {
  const map = shuffle([1, 2, 3, 4]);
  const rows = Math.random() < 0.5 ? [0, 1, 2, 3] : [1, 0, 3, 2];
  const sol = rows.map((r) => BASE[r].map((v) => map[v - 1]));
  const holes = new Set(shuffle([...Array(16).keys()]).slice(0, 9));
  return { sol, given: sol.flat().map((v, i) => (holes.has(i) ? 0 : v)) };
};

export const Sudoku = () => {
  const [p, setP] = useState(makePuzzle);
  const [vals, setVals] = useState(p.given);
  const [sel, setSel] = useState(null);
  const flat = p.sol.flat();
  const groups = [0, 1, 2, 3].flatMap((k) => [
    [0, 1, 2, 3].map((c) => k * 4 + c),
    [0, 1, 2, 3].map((r) => r * 4 + k),
    [0, 1, 4, 5].map((o) => (Math.floor(k / 2) * 8 + (k % 2) * 2) + o),
  ]);
  const full = vals.every(Boolean);
  const solved = full && groups.every((g) => new Set(g.map((i) => vals[i])).size === 4);
  const clash = (i) => full && !solved && groups.some((g) => g.includes(i) && g.filter((j) => vals[j] === vals[i]).length > 1);
  const reset = () => {
    const n = makePuzzle();
    setP(n);
    setVals(n.given);
    setSel(null);
  };
  const put = (n) => {
    if (sel === null || p.given[sel]) return;
    setVals(vals.map((v, i) => (i === sel ? n : v)));
  };
  return (
    <div data-testid="game-sudoku" className="text-center">
      <p className="text-sm text-slate-500">Fill each row, column and 2×2 box with 1–4.</p>
      <div className="mt-4 mx-auto grid grid-cols-4 w-56 border-2 border-slate-800 rounded-lg overflow-hidden">
        {vals.map((v, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          return (
            <button key={i} data-testid={`sudoku-cell-${i}`} onClick={() => setSel(i)}
              className={`h-14 text-xl font-semibold ${c === 1 ? "border-r-2 border-r-slate-800" : "border-r border-r-slate-200"} ${r === 1 ? "border-b-2 border-b-slate-800" : "border-b border-b-slate-200"} ${p.given[i] ? "bg-slate-50 text-slate-900" : clash(i) ? "text-[#c2410c]" : "text-eq"} ${sel === i ? "bg-eq-soft" : ""}`}>{v || ""}</button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4].map((n) => <button key={n} data-testid={`sudoku-num-${n}`} onClick={() => put(n)} className="h-11 w-11 rounded-xl bg-eq-soft text-eq-dark font-semibold hover:bg-eq hover:text-white transition-colors">{n}</button>)}
        <button data-testid="sudoku-clear" onClick={() => put(0)} className="h-11 px-3 rounded-xl border border-slate-200 text-sm text-slate-600">Clear</button>
      </div>
      <p data-testid="sudoku-status" className="mt-4 text-sm font-medium text-slate-700">{solved ? "Solved! Nicely done." : full ? "Almost — the orange numbers repeat in a row, column or box." : "Tap a cell, then a number."}</p>
      <button data-testid="sudoku-new" onClick={reset} className="mt-2 text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> New puzzle</button>
    </div>
  );
};
