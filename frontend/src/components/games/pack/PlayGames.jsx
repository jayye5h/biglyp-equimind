import { useEffect, useRef, useState } from "react";
import { Star, Hand, Scissors, FileText } from "lucide-react";
import { GameFrame, Btn, rand } from "./common";

/* ---------------- Green Light Tap ---------------- */
export const ReactionTap = () => {
  const [state, setState] = useState("idle"); // idle | wait | go | early | result
  const [ms, setMs] = useState(null);
  const [best, setBest] = useState(null);
  const t = useRef(null);
  const start = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  const click = () => {
    if (state === "idle" || state === "result" || state === "early") {
      setState("wait");
      t.current = setTimeout(() => { start.current = performance.now(); setState("go"); }, 1500 + rand(2000));
    } else if (state === "wait") {
      clearTimeout(t.current);
      setState("early");
    } else if (state === "go") {
      const v = Math.round(performance.now() - start.current);
      setMs(v);
      setBest((b) => (b === null ? v : Math.min(b, v)));
      setState("result");
    }
  };
  const look = { idle: "bg-eq text-white", wait: "bg-rose-400 text-white", go: "bg-emerald-500 text-white", early: "bg-amber-400 text-white", result: "bg-eq-soft text-eq-dark" }[state];
  const label = { idle: "Tap to start", wait: "Wait for green…", go: "TAP!", early: "Too soon! Tap to retry", result: `${ms} ms · tap to go again` }[state];
  return (
    <GameFrame id="reaction-tap" hint="When the circle turns green, tap as fast as you can." status={best !== null ? `Best: ${best} ms` : null}>
      <button data-testid="reaction-circle" onClick={click} className={`mx-auto h-44 w-44 rounded-full grid place-items-center font-semibold transition-colors ${look}`}>{label}</button>
    </GameFrame>
  );
};

/* ---------------- Catch the Stars ---------------- */
const spot = () => ({ x: 5 + rand(80), y: 5 + rand(75) });
export const CatchStars = () => {
  const [pos, setPos] = useState(spot);
  const [caught, setCaught] = useState(0);
  const [t0, setT0] = useState(null);
  const [time, setTime] = useState(null);
  const done = caught >= 10;
  useEffect(() => {
    if (done) return undefined;
    const t = setInterval(() => setPos(spot()), 1000);
    return () => clearInterval(t);
  }, [done, caught]);
  const hit = () => {
    const now = performance.now();
    if (!t0) setT0(now);
    const c = caught + 1;
    setCaught(c);
    if (c >= 10) setTime(((now - (t0 || now)) / 1000).toFixed(1));
    setPos(spot());
  };
  return (
    <GameFrame id="catch-stars" hint="Tap the star before it moves. Catch ten." status={done ? `All ten caught in ${time}s ✨` : `Caught ${caught}/10`}
      onReset={() => { setCaught(0); setT0(null); setTime(null); }}>
      <div className="relative mx-auto h-60 w-full max-w-xs rounded-2xl bg-gradient-to-b from-indigo-950 to-indigo-800 overflow-hidden">
        {!done && (
          <button data-testid="star" onClick={hit} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} className="absolute h-11 w-11 grid place-items-center transition-[left,top] duration-300">
            <Star className="h-9 w-9 fill-amber-300 text-amber-300" />
          </button>
        )}
        {done && <div className="absolute inset-0 grid place-items-center text-4xl">🌟</div>}
      </div>
    </GameFrame>
  );
};

/* ---------------- Guess the Word ---------------- */
const GW = ["SUNSHINE", "KINDNESS", "COURAGE", "BALANCE", "GENTLE", "FRIEND", "HOPEFUL", "RAINBOW"];
const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const GuessWord = () => {
  const [word, setWord] = useState(() => GW[rand(GW.length)]);
  const [tried, setTried] = useState([]);
  const misses = tried.filter((l) => !word.includes(l)).length;
  const won = word.split("").every((l) => tried.includes(l));
  const lost = misses >= 6;
  const reset = () => {
    let w = GW[rand(GW.length)];
    if (w === word) w = GW[(GW.indexOf(w) + 1) % GW.length];
    setWord(w);
    setTried([]);
  };
  return (
    <GameFrame id="guess-word" hint="Guess the hidden uplifting word one letter at a time." status={won ? `You got it — ${word}!` : lost ? `The word was ${word}. Try another!` : `Misses left: ${6 - misses}`}
      onReset={reset} resetLabel="New word">
      <div data-testid="guess-slots" className="flex justify-center gap-1">
        {word.split("").map((l, i) => <span key={i} className="h-10 w-8 border-b-2 border-eq grid place-items-center font-bold text-lg text-slate-900">{tried.includes(l) || lost ? l : ""}</span>)}
      </div>
      <div className="mt-5 mx-auto max-w-xs grid grid-cols-7 gap-1">
        {AZ.map((l) => {
          const t = tried.includes(l);
          return (
            <button key={l} data-testid={`guess-key-${l}`} disabled={t || won || lost} onClick={() => setTried((v) => [...v, l])}
              className={`h-9 rounded-lg text-sm font-semibold ${t ? (word.includes(l) ? "bg-eq-soft text-eq-dark" : "bg-slate-100 text-slate-300") : "bg-eq text-white hover:bg-eq-dark"} disabled:cursor-default`}>{l}</button>
          );
        })}
      </div>
    </GameFrame>
  );
};

/* ---------------- Higher or Lower ---------------- */
const FACE = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const HigherLower = () => {
  const [card, setCard] = useState(() => 1 + rand(13));
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [msg, setMsg] = useState("Will the next card be higher or lower?");
  const guess = (up) => {
    const n = 1 + rand(13);
    const ok = n === card || (up ? n > card : n < card);
    const s = ok ? streak + 1 : 0;
    setStreak(s);
    setBest((b) => Math.max(b, s));
    setMsg(ok ? `${FACE[n - 1]} — nice! Keep going.` : `${FACE[n - 1]} — not this time. New streak!`);
    setCard(n);
  };
  return (
    <GameFrame id="higher-lower" hint={msg} status={`Streak ${streak} · Best ${best}`}>
      <div data-testid="hl-card" className="mx-auto h-40 w-28 rounded-2xl border-2 border-eq/30 bg-white shadow-md grid place-items-center font-serif text-5xl font-bold text-eq-dark">{FACE[card - 1]}</div>
      <div className="mt-5 flex justify-center gap-3">
        <Btn data-testid="hl-higher" onClick={() => guess(true)}>Higher</Btn>
        <Btn data-testid="hl-lower" onClick={() => guess(false)}>Lower</Btn>
      </div>
    </GameFrame>
  );
};

/* ---------------- Rock Paper Scissors ---------------- */
const RPS = [{ k: "rock", icon: Hand, label: "Rock" }, { k: "paper", icon: FileText, label: "Paper" }, { k: "scissors", icon: Scissors, label: "Scissors" }];
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };
export const RockPaperScissors = () => {
  const [me, setMe] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [last, setLast] = useState(null);
  const over = me >= 3 || cpu >= 3;
  const play = (k) => {
    const c = RPS[rand(3)].k;
    const res = k === c ? "draw" : BEATS[k] === c ? "win" : "lose";
    if (res === "win") setMe((v) => v + 1);
    if (res === "lose") setCpu((v) => v + 1);
    setLast({ k, c, res });
  };
  const status = over ? (me >= 3 ? "You won the match! 🎉" : "Computer took this one — rematch?") : last ? `You: ${last.k} · Computer: ${last.c} → ${last.res === "draw" ? "draw" : last.res === "win" ? "you win the round" : "computer wins the round"}` : "First to three wins.";
  return (
    <GameFrame id="rps" hint={`You ${me} – ${cpu} Computer`} status={status} onReset={over ? () => { setMe(0); setCpu(0); setLast(null); } : null} resetLabel="Rematch">
      <div className="flex justify-center gap-3">
        {RPS.map((x) => (
          <button key={x.k} data-testid={`rps-${x.k}`} disabled={over} onClick={() => play(x.k)}
            className="h-24 w-24 rounded-2xl border-2 border-eq/20 bg-eq-bg flex flex-col items-center justify-center gap-1 text-sm text-slate-700 hover:border-eq disabled:opacity-40">
            <x.icon className="h-8 w-8 text-eq" />{x.label}
          </button>
        ))}
      </div>
    </GameFrame>
  );
};
