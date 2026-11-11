import { useEffect, useRef, useState } from "react";
import { Cloud, Sun } from "lucide-react";
import { GameFrame, Btn, rand } from "./common";

/* ---------------- Bubble Pop ---------------- */
const makeBubbles = () => Array.from({ length: 14 }, (_, i) => ({ i, x: 4 + rand(78), y: 4 + rand(70), s: 34 + rand(26), d: (rand(30) / 10).toFixed(1) }));
export const BubblePop = () => {
  const [b, setB] = useState(makeBubbles);
  const [popped, setPopped] = useState([]);
  const done = popped.length === b.length;
  return (
    <GameFrame id="bubble-pop" hint="Pop every bubble — slowly or quickly, it's up to you." status={done ? "All popped. Feel a little lighter?" : `Popped ${popped.length}/${b.length}`}
      onReset={() => { setB(makeBubbles()); setPopped([]); }} resetLabel="More bubbles">
      <style>{"@keyframes eqfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}"}</style>
      <div className="relative mx-auto h-60 w-full max-w-xs rounded-2xl bg-gradient-to-b from-eq-soft to-white overflow-hidden">
        {b.map((x) => {
          const p = popped.includes(x.i);
          return (
            <button key={x.i} data-testid={`bubble-${x.i}`} disabled={p} onClick={() => setPopped((v) => [...v, x.i])}
              style={{ left: `${x.x}%`, top: `${x.y}%`, width: x.s, height: x.s, animation: `eqfloat 3s ease-in-out ${x.d}s infinite` }}
              className={`absolute rounded-full border-2 border-eq/40 bg-white/60 shadow-inner transition-[transform,opacity] duration-300 ${p ? "scale-150 opacity-0" : "hover:bg-eq-soft"}`} />
          );
        })}
      </div>
    </GameFrame>
  );
};

/* ---------------- Breath Balloon ---------------- */
export const BreathBalloon = () => {
  const [size, setSize] = useState(0);
  const [hold, setHold] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const sizeRef = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      sizeRef.current = Math.max(0, Math.min(1, sizeRef.current + (hold ? 0.0125 : -0.0125)));
      setSize(sizeRef.current);
    }, 50);
    return () => clearInterval(t);
  }, [hold]);
  const release = () => {
    if (!hold) return;
    setHold(false);
    if (sizeRef.current >= 0.5) setBreaths((n) => n + 1);
  };
  const done = breaths >= 5;
  return (
    <GameFrame id="breath-balloon" hint="Hold to breathe in (about 4 seconds), let go to breathe out slowly."
      status={done ? "Five slow breaths. Well done." : `${hold ? "Breathe in…" : size > 0.05 ? "Breathe out…" : "Ready"} · Breaths ${breaths}/5`}
      onReset={() => setBreaths(0)}>
      <div className="h-52 grid place-items-center">
        <div data-testid="balloon" className="rounded-full bg-gradient-to-br from-eq to-eq-dark shadow-lg" style={{ width: 50 + size * 140, height: 56 + size * 150 }} />
      </div>
      <Btn data-testid="breath-hold" onPointerDown={() => setHold(true)} onPointerUp={release} onPointerLeave={release} disabled={done}>
        {hold ? "Breathing in…" : "Hold to breathe in"}
      </Btn>
    </GameFrame>
  );
};

/* ---------------- Zen Sand ---------------- */
export const ZenSand = () => {
  const ref = useRef(null);
  const last = useRef(null);
  const [strokes, setStrokes] = useState(0);
  const smooth = () => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    c.fillStyle = "#f3e9d6";
    c.fillRect(0, 0, 300, 220);
  };
  useEffect(() => {
    smooth();
    const t = setInterval(() => {
      const c = ref.current?.getContext("2d");
      if (!c) return;
      c.fillStyle = "rgba(243,233,214,0.06)";
      c.fillRect(0, 0, 300, 220);
    }, 120);
    return () => clearInterval(t);
  }, []);
  const pt = (e) => {
    const r = ref.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 300, ((e.clientY - r.top) / r.height) * 220];
  };
  const move = (e) => {
    if (!last.current) return;
    const c = ref.current.getContext("2d");
    const p = pt(e);
    c.strokeStyle = "#b89b6e";
    c.lineWidth = 6;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(...last.current);
    c.lineTo(...p);
    c.stroke();
    last.current = p;
  };
  return (
    <GameFrame id="zen-sand" hint="Draw slow lines in the sand. Watch them fade on their own." status={`Lines drawn: ${strokes}`} onReset={smooth} resetLabel="Smooth the sand">
      <canvas ref={ref} width={300} height={220} data-testid="zen-canvas"
        onPointerDown={(e) => { last.current = pt(e); setStrokes((n) => n + 1); }} onPointerMove={move} onPointerUp={() => { last.current = null; }} onPointerLeave={() => { last.current = null; }}
        className="mx-auto w-full max-w-xs rounded-2xl touch-none cursor-crosshair shadow-inner" />
    </GameFrame>
  );
};

/* ---------------- 5-4-3-2-1 Grounding ---------------- */
const SENSES = [[5, "things you can see"], [4, "things you can touch"], [3, "things you can hear"], [2, "things you can smell"], [1, "thing you can taste"]];
export const Grounding = () => {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [txt, setTxt] = useState("");
  const done = step >= SENSES.length;
  const [n, label] = SENSES[Math.min(step, 4)];
  const add = () => {
    const next = [...items, txt.trim() || "noticed"];
    setTxt("");
    if (next.length >= n) { setItems([]); setStep((s) => s + 1); } else setItems(next);
  };
  return (
    <GameFrame id="grounding" hint="Slowly notice what is around you right now." status={done ? "You're here, in this moment. Nicely grounded." : `Step ${step + 1}/5`}
      onReset={() => { setStep(0); setItems([]); }} resetLabel="Start again">
      {done ? <p className="text-5xl">🌿</p> : (
        <div>
          <p className="font-serif text-2xl font-bold text-slate-900">{n} {label}</p>
          <div className="mt-3 flex justify-center gap-2">{Array.from({ length: n }, (_, i) => <span key={i} className={`h-4 w-4 rounded-full ${i < items.length ? "bg-eq" : "bg-eq-soft"}`} />)}</div>
          <div className="mt-4 flex gap-2 max-w-xs mx-auto">
            <input data-testid="grounding-input" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Name it (optional)"
              className="flex-1 rounded-full border border-eq/20 px-4 py-2 text-sm outline-none focus:border-eq" />
            <Btn data-testid="grounding-add" onClick={add}>Noticed</Btn>
          </div>
          {items.length > 0 && <p className="mt-3 text-xs text-slate-500">{items.join(" · ")}</p>}
        </div>
      )}
    </GameFrame>
  );
};

/* ---------------- Steady Beat ---------------- */
const BEAT = 1200;
export const SteadyBeat = () => {
  const [t0, setT0] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [taps, setTaps] = useState([]);
  useEffect(() => {
    if (!t0) return undefined;
    const t = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 250); }, BEAT);
    return () => clearInterval(t);
  }, [t0]);
  const done = taps.length >= 8;
  const tap = () => {
    if (!t0 || done) return;
    const off = (performance.now() - t0) % BEAT;
    setTaps((v) => [...v, Math.min(off, BEAT - off) <= 250]);
  };
  const good = taps.filter(Boolean).length;
  return (
    <GameFrame id="steady-beat" hint="Tap the circle in time with the slow pulse. Eight taps."
      status={done ? `${good} of 8 in time — your rhythm is steady.` : t0 ? `Taps ${taps.length}/8 · in time ${good}` : "Press start, then follow the pulse."}
      onReset={() => { setT0(null); setTaps([]); }}>
      <button data-testid="beat-circle" onClick={tap} className={`mx-auto h-36 w-36 rounded-full grid place-items-center text-white font-semibold transition-transform duration-200 ${pulse ? "scale-110 bg-eq-dark" : "bg-eq"}`}>
        {t0 ? (done ? "Done" : "Tap") : "…"}
      </button>
      {!t0 && <div className="mt-4"><Btn data-testid="beat-start" onClick={() => setT0(performance.now())}>Start</Btn></div>}
    </GameFrame>
  );
};

/* ---------------- Worry Clouds ---------------- */
const WORRIES = ["deadlines", "what if…", "exams", "money", "messages", "the future", "comparing", "sleep"];
export const WorryClouds = () => {
  const [clear, setClear] = useState([]);
  const done = clear.length === WORRIES.length;
  return (
    <GameFrame id="worry-clouds" hint="Tap each worry cloud to let it drift away." status={done ? "Clear skies. Worries pass — like weather." : `Cleared ${clear.length}/${WORRIES.length}`}
      onReset={() => setClear([])} resetLabel="New clouds">
      <div className={`mx-auto max-w-xs rounded-2xl p-4 grid grid-cols-2 gap-3 transition-colors duration-700 ${done ? "bg-amber-50" : "bg-slate-100"}`}>
        {WORRIES.map((w, i) => {
          const c = clear.includes(i);
          return (
            <button key={w} data-testid={`cloud-${i}`} onClick={() => !c && setClear((v) => [...v, i])}
              className={`rounded-xl py-3 flex flex-col items-center gap-1 text-xs transition-colors duration-500 ${c ? "bg-amber-100 text-amber-700" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {c ? <Sun className="h-7 w-7 text-amber-500" /> : <Cloud className="h-7 w-7 text-slate-400" />}{c ? "let go" : w}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
};
