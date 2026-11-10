import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Check } from "lucide-react";

const phasesOf = (p) => [
  { k: "in", label: "Breathe in", secs: p.inhale, scale: 1 },
  { k: "hold", label: "Hold gently", secs: p.hold, scale: 1 },
  { k: "out", label: "Breathe out slowly", secs: p.exhale, scale: 0.6 },
  { k: "hold2", label: "Rest", secs: p.hold2, scale: 0.6 },
].filter((x) => x.secs > 0);

const useTicker = (running, onTick) => {
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(onTick, 1000);
    return () => clearInterval(t);
  }, [running, onTick]);
};

const Done = ({ text, onAgain }) => (
  <div data-testid="exercise-done" className="text-center py-4">
    <span className="mx-auto h-16 w-16 rounded-full bg-eq-soft grid place-items-center"><Check className="h-8 w-8 text-eq-dark" /></span>
    <p className="mt-4 font-serif text-xl font-bold text-slate-900">You did it.</p>
    <p className="mt-2 text-slate-600 max-w-sm mx-auto">{text}</p>
    <button data-testid="exercise-again-btn" onClick={onAgain} className="mt-5 text-sm text-eq hover:text-eq-dark inline-flex items-center gap-1.5"><RotateCcw className="h-4 w-4" /> Do it again</button>
  </div>
);

const Breath = ({ ex }) => {
  const phases = phasesOf(ex.pattern);
  const [state, setState] = useState({ run: false, cycle: 0, pi: 0, left: phases[0].secs, done: false });
  const tick = () => setState((s) => {
    if (s.left > 1) return { ...s, left: s.left - 1 };
    const pi = (s.pi + 1) % phases.length;
    const cycle = pi === 0 ? s.cycle + 1 : s.cycle;
    if (cycle >= ex.pattern.cycles) return { ...s, run: false, done: true };
    return { ...s, pi, cycle, left: phases[pi].secs };
  });
  useTicker(state.run, tick);
  const ph = phases[state.pi];
  const reset = () => setState({ run: true, cycle: 0, pi: 0, left: phases[0].secs, done: false });
  if (state.done) return <Done text={ex.finish} onAgain={reset} />;
  return (
    <div className="text-center">
      <div className="relative mx-auto h-56 w-56 grid place-items-center">
        <div className="absolute inset-0 rounded-full bg-eq-soft/60" />
        <motion.div data-testid="breath-circle" className="absolute inset-6 rounded-full bg-gradient-to-br from-eq/80 to-eq-dark/80"
          animate={{ scale: state.run ? ph.scale : 0.6 }} initial={{ scale: 0.6 }} transition={{ duration: state.run && (ph.k === "in" || ph.k === "out") ? ph.secs : 0.4, ease: "easeInOut" }} />
        <div className="relative text-white">
          {state.run ? (<><div data-testid="breath-phase" className="font-serif text-xl font-bold">{ph.label}</div><div className="text-3xl font-semibold mt-1">{state.left}</div></>)
            : <div className="font-serif text-lg font-bold px-6">Ready when you are</div>}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{state.run ? `Round ${state.cycle + 1} of ${ex.pattern.cycles}` : `${ex.pattern.cycles} gentle rounds · about ${ex.minutes} min`}</p>
      {!state.run && <button data-testid="exercise-start-btn" onClick={reset} className="mt-4 h-11 px-6 rounded-xl bg-eq text-white font-medium hover:bg-eq-dark transition-colors">Begin</button>}
    </div>
  );
};

const Steps = ({ ex }) => {
  const [i, setI] = useState(-1);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const go = (n) => {
    if (n >= ex.steps.length) { setDone(true); return; }
    setI(n);
    setLeft(ex.steps[n].secs);
  };
  const tick = () => setLeft((l) => Math.max(0, l - 1));
  useTicker(i >= 0 && !done && left > 0, tick);
  if (done) return <Done text={ex.finish} onAgain={() => { setDone(false); go(0); }} />;
  if (i < 0) return (
    <div className="text-center py-2">
      <ol className="text-left space-y-2 max-w-sm mx-auto">
        {ex.steps.map((s, n) => <li key={n} className="flex gap-3 text-sm text-slate-600"><span className="h-6 w-6 shrink-0 rounded-full bg-eq-soft text-eq-dark text-xs font-semibold grid place-items-center">{n + 1}</span>{s.text}</li>)}
      </ol>
      <button data-testid="exercise-start-btn" onClick={() => go(0)} className="mt-6 h-11 px-6 rounded-xl bg-eq text-white font-medium hover:bg-eq-dark transition-colors">Begin</button>
    </div>
  );
  const s = ex.steps[i];
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-eq">Step {i + 1} of {ex.steps.length}</p>
      <motion.p key={i} data-testid="exercise-step-text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-serif text-xl font-bold text-slate-900 min-h-[84px]">{s.text}</motion.p>
      <div className="mt-4 h-2 rounded-full bg-eq-soft overflow-hidden"><div className="h-full bg-eq transition-[width] duration-1000 ease-linear" style={{ width: `${100 - (left / s.secs) * 100}%` }} /></div>
      <p className="mt-2 text-sm text-slate-500">{left > 0 ? `${left}s — take your time` : "Ready for the next step whenever you are"}</p>
      <div className="mt-5 flex justify-between">
        <button data-testid="exercise-back-btn" disabled={i === 0} onClick={() => go(i - 1)} className="text-sm text-slate-500 inline-flex items-center gap-1 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /> Back</button>
        <button data-testid="exercise-next-btn" onClick={() => go(i + 1)} className="h-10 px-5 rounded-full bg-eq text-white text-sm font-medium inline-flex items-center gap-1.5">{i === ex.steps.length - 1 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export const ExercisePlayer = ({ ex }) => (
  <div data-testid={`exercise-player-${ex.id}`}>
    <p className="text-center text-slate-600 mb-5">{ex.intro}</p>
    {ex.kind === "breath" ? <Breath ex={ex} /> : <Steps ex={ex} />}
  </div>
);
