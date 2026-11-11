import { useEffect, useRef, useState } from "react";
import { Star, Heart, Leaf, Circle } from "lucide-react";
import { GameFrame, Btn, rand, shuffle } from "./common";

/* ---------------- Odd Colour Out ---------------- */
const board = (round) => {
  const size = round < 3 ? 3 : round < 7 ? 4 : 5;
  return { size, odd: rand(size * size), hue: rand(360), diff: Math.max(6, 20 - round * 1.5) };
};
export const OddColour = () => {
  const [round, setRound] = useState(0);
  const [b, setB] = useState(() => board(0));
  const [msg, setMsg] = useState(null);
  const done = round >= 10;
  const pick = (i) => {
    if (done) return;
    if (i === b.odd) {
      const r = round + 1;
      setRound(r);
      setB(board(r));
      setMsg(null);
    } else {
      setMsg("Not quite — look again.");
      setB(board(round));
    }
  };
  return (
    <GameFrame id="odd-colour" hint="Tap the tile whose shade is slightly different." status={done ? "Ten rounds — sharp eyes!" : msg || `Round ${round + 1}/10`}
      onReset={() => { setRound(0); setB(board(0)); setMsg(null); }}>
      <div className="mx-auto w-60 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${b.size}, 1fr)` }}>
        {Array.from({ length: b.size * b.size }, (_, i) => (
          <button key={`${round}-${i}`} data-testid={`odd-tile-${i}`} data-odd={i === b.odd} onClick={() => pick(i)} className="aspect-square rounded-lg"
            style={{ background: `hsl(${b.hue} 60% ${i === b.odd ? 55 + b.diff : 55}%)` }} />
        ))}
      </div>
    </GameFrame>
  );
};

/* ---------------- Echo Pattern (Simon) ---------------- */
const PADS = ["bg-sky-400", "bg-emerald-400", "bg-amber-400", "bg-violet-400"];
export const EchoPattern = () => {
  const [seq, setSeq] = useState([]);
  const [lit, setLit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const play = (s) => {
    setBusy(true);
    setPos(0);
    s.forEach((p, i) => {
      timers.current.push(setTimeout(() => setLit(p), 600 * i + 400));
      timers.current.push(setTimeout(() => setLit(null), 600 * i + 800));
    });
    timers.current.push(setTimeout(() => setBusy(false), 600 * s.length + 400));
  };
  const start = () => {
    const s = [rand(4)];
    setSeq(s);
    setOver(false);
    play(s);
  };
  const tap = (p) => {
    if (busy || !seq.length || over) return;
    setLit(p);
    timers.current.push(setTimeout(() => setLit(null), 200));
    if (p !== seq[pos]) {
      setOver(true);
      setBest((b) => Math.max(b, seq.length - 1));
      return;
    }
    if (pos + 1 === seq.length) {
      setBest((b) => Math.max(b, seq.length));
      const s = [...seq, rand(4)];
      setSeq(s);
      timers.current.push(setTimeout(() => play(s), 500));
    } else setPos(pos + 1);
  };
  const status = over ? `Pattern of ${seq.length - 1} remembered. Best: ${best}` : !seq.length ? "Press start and watch closely." : busy ? "Watch…" : `Your turn · ${pos}/${seq.length}`;
  return (
    <GameFrame id="simon" hint="Watch the pads light up, then repeat the pattern." status={status}>
      <div className="mx-auto w-52 grid grid-cols-2 gap-3">
        {PADS.map((c, i) => (
          <button key={c} data-testid={`simon-pad-${i}`} onClick={() => tap(i)} className={`h-24 rounded-2xl transition-opacity duration-150 ${c} ${lit === i ? "opacity-100 ring-4 ring-white shadow-lg" : "opacity-40"}`} />
        ))}
      </div>
      {(!seq.length || over) && <div className="mt-4"><Btn data-testid="simon-start" onClick={start}>{over ? "Try again" : "Start"}</Btn></div>}
    </GameFrame>
  );
};

/* ---------------- Slide Puzzle ---------------- */
const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const nbrs = (i) => [i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter((j) => j >= 0 && j < 9);
const scrambleTiles = () => {
  let t = [...SOLVED];
  let prev = -1;
  for (let k = 0; k < 80; k++) {
    const z = t.indexOf(0);
    const opts = nbrs(z).filter((j) => j !== prev);
    const j = opts[rand(opts.length)];
    [t[z], t[j]] = [t[j], t[z]];
    prev = z;
  }
  return t.join() === SOLVED.join() ? scrambleTiles() : t;
};
export const SlidePuzzle = () => {
  const [t, setT] = useState(scrambleTiles);
  const [moves, setMoves] = useState(0);
  const solved = t.join() === SOLVED.join();
  const move = (i) => {
    const z = t.indexOf(0);
    if (solved || !nbrs(z).includes(i)) return;
    const n = [...t];
    [n[z], n[i]] = [n[i], n[z]];
    setT(n);
    setMoves((m) => m + 1);
  };
  return (
    <GameFrame id="slide-puzzle" hint="Slide the tiles into order, 1 to 8." status={solved ? `Solved in ${moves} moves!` : `Moves: ${moves}`}
      onReset={() => { setT(scrambleTiles()); setMoves(0); }} resetLabel="New puzzle">
      <div className="mx-auto w-56 grid grid-cols-3 gap-1.5">
        {t.map((v, i) => (
          <button key={i} data-testid={`slide-tile-${i}`} data-value={v} onClick={() => move(i)}
            className={`aspect-square rounded-xl font-serif text-2xl font-bold ${v ? (solved ? "bg-emerald-500 text-white" : "bg-eq text-white hover:bg-eq-dark") : "bg-eq-bg"}`}>{v || ""}</button>
        ))}
      </div>
    </GameFrame>
  );
};

/* ---------------- Quick Sums ---------------- */
const sum = () => {
  const a = 2 + rand(15);
  const b = 1 + rand(10);
  const plus = Math.random() < 0.6 || a <= b;
  const ans = plus ? a + b : a - b;
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(Math.max(0, ans + rand(7) - 3));
  return { q: `${a} ${plus ? "+" : "−"} ${b}`, ans, opts: shuffle([...opts]) };
};
export const QuickSums = () => {
  const [left, setLeft] = useState(null);
  const [q, setQ] = useState(sum);
  const [score, setScore] = useState(0);
  useEffect(() => {
    if (left === null || left <= 0) return undefined;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const live = left !== null && left > 0;
  const answer = (v) => {
    if (!live) return;
    if (v === q.ans) setScore((s) => s + 1);
    setQ(sum());
  };
  return (
    <GameFrame id="quick-sums" hint="Answer as many easy sums as you can in 30 seconds."
      status={left === null ? "Press start when you're ready." : live ? `${left}s left · Score ${score}` : `Time! You answered ${score} correctly.`}>
      {live ? (
        <>
          <p data-testid="sums-question" className="font-serif text-4xl font-bold text-slate-900">{q.q}</p>
          <div className="mt-4 mx-auto w-56 grid grid-cols-2 gap-2">
            {q.opts.map((o) => <button key={o} data-testid={`sums-opt-${o}`} data-correct={o === q.ans} onClick={() => answer(o)} className="h-12 rounded-xl bg-eq text-white text-lg font-semibold hover:bg-eq-dark">{o}</button>)}
          </div>
        </>
      ) : <Btn data-testid="sums-start" onClick={() => { setScore(0); setQ(sum()); setLeft(30); }}>{left === null ? "Start" : "Play again"}</Btn>}
    </GameFrame>
  );
};

/* ---------------- Calm Word Search ---------------- */
const GRID = ["CALMXQP", "HTRESTB", "OYKWNUE", "PDFEASE", "EGJVZIK", "SMILEOR", "LNWYUBT"];
const FIND = ["CALM", "REST", "HOPE", "EASE", "SMILE"];
const lineCells = (a, b) => {
  const [r1, c1] = a;
  const [r2, c2] = b;
  if (r1 !== r2 && c1 !== c2) return null;
  const n = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  return Array.from({ length: n + 1 }, (_, k) => [r1 + dr * k, c1 + dc * k]);
};
export const WordSearch = () => {
  const [first, setFirst] = useState(null);
  const [found, setFound] = useState({});
  const [msg, setMsg] = useState(null);
  const tap = (r, c) => {
    if (!first) { setFirst([r, c]); setMsg(null); return; }
    const cells = lineCells(first, [r, c]);
    setFirst(null);
    const w = cells && cells.map(([y, x]) => GRID[y][x]).join("");
    const hit = w && FIND.find((f) => f === w || f === [...w].reverse().join(""));
    if (hit && !found[hit]) setFound((f) => ({ ...f, [hit]: cells }));
    else setMsg("No word there — try another line.");
  };
  const isFound = (r, c) => Object.values(found).some((cs) => cs.some(([y, x]) => y === r && x === c));
  const n = Object.keys(found).length;
  return (
    <GameFrame id="word-search" hint="Tap the first letter, then the last letter, of each hidden word." status={n === FIND.length ? "All five calm words found." : msg || `Found ${n}/5`}
      onReset={() => { setFound({}); setFirst(null); }} resetLabel="Start over">
      <div className="mx-auto w-64 grid grid-cols-7 gap-1">
        {GRID.map((row, r) => row.split("").map((ch, c) => {
          const sel = first && first[0] === r && first[1] === c;
          return <button key={`${r}-${c}`} data-testid={`ws-${r}-${c}`} onClick={() => tap(r, c)}
            className={`aspect-square rounded-md text-sm font-bold ${isFound(r, c) ? "bg-eq text-white" : sel ? "bg-amber-300 text-slate-900" : "bg-eq-bg text-slate-700 hover:bg-eq-soft"}`}>{ch}</button>;
        }))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">{FIND.map((f) => <span key={f} className={`rounded-full px-2.5 py-0.5 ${found[f] ? "bg-eq-soft text-eq-dark line-through" : "bg-slate-100 text-slate-500"}`}>{f}</span>)}</div>
    </GameFrame>
  );
};

/* ---------------- Lights Out ---------------- */
const press = (g, i) => {
  const n = [...g];
  [i, ...nbrs(i)].forEach((j) => { n[j] = !n[j]; });
  return n;
};
const newLights = () => {
  let g = Array(9).fill(false);
  const k = 3 + rand(3);
  shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, k).forEach((i) => { g = press(g, i); });
  return g.some(Boolean) ? g : newLights();
};
export const LightsOut = () => {
  const [g, setG] = useState(newLights);
  const [moves, setMoves] = useState(0);
  const done = !g.some(Boolean);
  return (
    <GameFrame id="lights-out" hint="Each tap flips a light and its neighbours. Turn every light off." status={done ? `All dark in ${moves} moves. Restful!` : `Moves: ${moves}`}
      onReset={() => { setG(newLights()); setMoves(0); }} resetLabel="New puzzle">
      <div className="mx-auto w-52 grid grid-cols-3 gap-2 rounded-2xl bg-slate-800 p-3">
        {g.map((on, i) => (
          <button key={i} data-testid={`light-${i}`} data-on={on} onClick={() => { if (!done) { setG(press(g, i)); setMoves((m) => m + 1); } }}
            className={`aspect-square rounded-xl transition-colors duration-200 ${on ? "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.7)]" : "bg-slate-600"}`} />
        ))}
      </div>
    </GameFrame>
  );
};

/* ---------------- Pattern Recall ---------------- */
export const PatternRecall = () => {
  const [level, setLevel] = useState(3);
  const [cells, setCells] = useState([]);
  const [show, setShow] = useState(false);
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState("idle"); // idle | show | input | win | miss
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  const go = (lv = level) => {
    const c = shuffle([...Array(16).keys()]).slice(0, lv);
    setCells(c);
    setPicked([]);
    setShow(true);
    setState("show");
    t.current = setTimeout(() => { setShow(false); setState("input"); }, 1400);
  };
  const tap = (i) => {
    if (state !== "input" || picked.includes(i)) return;
    if (!cells.includes(i)) { setState("miss"); setPicked((p) => [...p, i]); return; }
    const p = [...picked, i];
    setPicked(p);
    if (p.length === cells.length) setState("win");
  };
  const next = () => {
    const lv = state === "win" ? Math.min(level + 1, 8) : level;
    setLevel(lv);
    go(lv);
  };
  const status = { idle: "Press start to see the pattern.", show: "Remember these…", input: `Tap the ${cells.length} squares`, win: `Perfect! Level ${level - 2} done.`, miss: "Not quite — try this level again." }[state];
  return (
    <GameFrame id="pattern-recall" hint="Remember which squares light up, then tap them back." status={status}>
      <div className="mx-auto w-56 grid grid-cols-4 gap-1.5">
        {Array.from({ length: 16 }, (_, i) => {
          const lit = (show && cells.includes(i)) || (picked.includes(i) && cells.includes(i));
          const bad = picked.includes(i) && !cells.includes(i);
          return <button key={i} data-testid={`recall-cell-${i}`} data-target={cells.includes(i)} onClick={() => tap(i)}
            className={`aspect-square rounded-lg transition-colors ${lit ? "bg-eq" : bad ? "bg-rose-300" : "bg-eq-bg hover:bg-eq-soft"}`} />;
        })}
      </div>
      {state !== "show" && state !== "input" && <div className="mt-4"><Btn data-testid="recall-start" onClick={state === "idle" ? () => go() : next}>{state === "idle" ? "Start" : state === "win" ? "Next level" : "Retry"}</Btn></div>}
    </GameFrame>
  );
};

/* ---------------- Count the Shapes ---------------- */
const SHAPES = [{ k: "star", I: Star, c: "text-amber-400 fill-amber-300" }, { k: "heart", I: Heart, c: "text-rose-400 fill-rose-300" }, { k: "leaf", I: Leaf, c: "text-emerald-500" }, { k: "circle", I: Circle, c: "text-sky-400 fill-sky-200" }];
const makeCount = () => {
  const items = Array.from({ length: 20 }, () => (Math.random() < 0.8 ? rand(4) : null));
  const target = rand(4);
  const ans = items.filter((x) => x === target).length;
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(Math.max(0, ans + rand(5) - 2));
  return { items, target, ans, opts: [...opts].sort((a, b) => a - b) };
};
export const CountShapes = () => {
  const [q, setQ] = useState(makeCount);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState(null);
  const done = round >= 5;
  const T = SHAPES[q.target];
  const answer = (v) => {
    const ok = v === q.ans;
    if (ok) setScore((s) => s + 1);
    setMsg(ok ? "Correct!" : `It was ${q.ans}.`);
    setRound((r) => r + 1);
    setQ(makeCount());
  };
  return (
    <GameFrame id="count-shapes" hint={done ? "Slow counting, calm mind." : <>How many <b>{T.k}s</b> can you count?</>} status={done ? `${score} of 5 right.` : `${msg ? msg + " · " : ""}Round ${round + 1}/5`}
      onReset={done ? () => { setRound(0); setScore(0); setMsg(null); } : null}>
      {!done && (
        <>
          <div className="mx-auto w-60 grid grid-cols-5 gap-1.5 rounded-2xl bg-eq-bg p-3">
            {q.items.map((x, i) => {
              const S = x === null ? null : SHAPES[x];
              return <span key={i} className="h-9 grid place-items-center">{S && <S.I className={`h-6 w-6 ${S.c}`} />}</span>;
            })}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {q.opts.map((o) => <button key={o} data-testid={`count-opt-${o}`} data-correct={o === q.ans} onClick={() => answer(o)} className="h-11 w-12 rounded-xl bg-eq text-white font-semibold hover:bg-eq-dark">{o}</button>)}
          </div>
        </>
      )}
    </GameFrame>
  );
};
