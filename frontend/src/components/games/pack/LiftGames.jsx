import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { GameFrame, Btn, rand, shuffle } from "./common";

/* ---------------- Gratitude Jar ---------------- */
export const GratitudeJar = () => {
  const [items, setItems] = useState([]);
  const [txt, setTxt] = useState("");
  const add = () => {
    if (!txt.trim() || items.length >= 3) return;
    setItems((v) => [...v, txt.trim()]);
    setTxt("");
  };
  const done = items.length >= 3;
  return (
    <GameFrame id="gratitude-jar" hint="Drop three small good things from today into the jar." status={done ? "Your jar is full. Small good things count." : `${items.length}/3 in the jar`}
      onReset={() => setItems([])} resetLabel="Empty the jar">
      <div className="mx-auto relative h-44 w-32 rounded-b-[2.5rem] rounded-t-2xl border-4 border-eq/30 bg-white overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-200 to-amber-100 transition-[height] duration-700" style={{ height: `${(items.length / 3) * 100}%` }} />
        <div className="absolute inset-0 flex flex-col-reverse items-center gap-1 p-2">
          {items.map((t, i) => <span key={i} className="relative max-w-full truncate rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-amber-800">{t}</span>)}
        </div>
      </div>
      {!done && (
        <div className="mt-4 flex gap-2 max-w-xs mx-auto">
          <input data-testid="gratitude-input" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="e.g. a good cup of chai"
            className="flex-1 rounded-full border border-eq/20 px-4 py-2 text-sm outline-none focus:border-eq" />
          <Btn data-testid="gratitude-add" onClick={add} disabled={!txt.trim()}>Add</Btn>
        </div>
      )}
    </GameFrame>
  );
};

/* ---------------- Kindness Cards ---------------- */
const KIND = [
  "You don't have to have it all figured out today.", "Rest is part of the work, not a break from it.", "You've survived every hard day so far.",
  "Progress is still progress, even when it's slow.", "It's okay to ask for help — that's a strength.", "Your worth isn't your marks.",
  "You're allowed to take up space.", "One small step is enough for now.", "Be as kind to yourself as you are to a friend.",
  "You are more than this one week.", "Feelings come and go, like clouds.", "You're doing better than you think.",
];
export const KindnessCards = () => {
  const [i, setI] = useState(null);
  const [kept, setKept] = useState([]);
  const draw = () => {
    let n = rand(KIND.length);
    if (n === i) n = (n + 1) % KIND.length;
    setI(n);
  };
  return (
    <GameFrame id="kindness-cards" hint="Flip a card. Keep the messages that feel true." status={`Kept ${kept.length} card${kept.length === 1 ? "" : "s"}`}
      onReset={() => { setKept([]); setI(null); }} resetLabel="Clear kept cards">
      <button data-testid="kind-card" onClick={draw} className={`mx-auto h-40 w-full max-w-xs rounded-3xl p-6 grid place-items-center transition-colors ${i === null ? "bg-eq text-white" : "bg-eq-soft text-slate-800"}`}>
        {i === null ? <span className="inline-flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5" /> Tap to flip</span> : <span className="font-serif text-lg leading-snug">{KIND[i]}</span>}
      </button>
      {i !== null && (
        <div className="mt-4 flex justify-center gap-2">
          <Btn data-testid="kind-keep" onClick={() => !kept.includes(i) && setKept((v) => [...v, i])} disabled={kept.includes(i)}><Heart className="inline h-4 w-4 mr-1" />Keep</Btn>
          <Btn data-testid="kind-next" onClick={draw} className="bg-white border border-eq/30 text-eq-dark hover:bg-eq-soft">Next card</Btn>
        </div>
      )}
      {kept.length > 0 && <ul className="mt-4 space-y-1 text-xs text-slate-600">{kept.map((k) => <li key={k}>♥ {KIND[k]}</li>)}</ul>}
    </GameFrame>
  );
};

/* ---------------- Affirmation Builder ---------------- */
const PARTS = [
  ["I am learning to", "Today I can", "I am allowed to", "Step by step, I will"],
  ["be kind to myself", "take one small step", "rest without guilt", "ask for help"],
  ["and that is enough.", "at my own pace.", "even on hard days.", "and I'm proud of that."],
];
export const Affirmation = () => {
  const [pick, setPick] = useState([null, null, null]);
  const [saved, setSaved] = useState([]);
  const full = pick.every((p) => p !== null);
  const sentence = pick.map((p, c) => (p === null ? "…" : PARTS[c][p])).join(" ");
  return (
    <GameFrame id="affirmation" hint="Pick one from each row to build a sentence that feels true for you." status={saved.length ? `Saved ${saved.length}` : null}
      onReset={() => setPick([null, null, null])} resetLabel="Build another">
      <p data-testid="affirmation-sentence" className={`mx-auto max-w-sm rounded-2xl p-4 font-serif text-lg ${full ? "bg-eq-soft text-slate-900" : "bg-slate-50 text-slate-400"}`}>{sentence}</p>
      <div className="mt-4 space-y-2">
        {PARTS.map((row, c) => (
          <div key={c} className="flex flex-wrap justify-center gap-1.5">
            {row.map((w, k) => (
              <button key={w} data-testid={`aff-${c}-${k}`} onClick={() => setPick((p) => p.map((v, j) => (j === c ? k : v)))}
                className={`rounded-full px-3 py-1 text-xs border transition-colors ${pick[c] === k ? "bg-eq text-white border-eq" : "border-eq/20 text-slate-600 hover:border-eq"}`}>{w}</button>
            ))}
          </div>
        ))}
      </div>
      {full && <div className="mt-4"><Btn data-testid="aff-save" onClick={() => !saved.includes(sentence) && setSaved((v) => [...v, sentence])}>Save this one</Btn></div>}
      {saved.length > 0 && <ul className="mt-3 space-y-1 text-xs text-slate-600">{saved.map((s) => <li key={s}>✦ {s}</li>)}</ul>}
    </GameFrame>
  );
};

/* ---------------- Kind Word Scramble ---------------- */
const WORDS = ["HOPE", "CALM", "BRAVE", "SMILE", "PEACE", "KIND", "SHINE", "GROW"];
const scramble = (w) => {
  let s;
  do s = shuffle(w.split("").map((ch, i) => ({ ch, i }))); while (s.map((x) => x.ch).join("") === w);
  return s;
};
export const WordScramble = () => {
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState(() => scramble(WORDS[0]));
  const [used, setUsed] = useState([]);
  const [score, setScore] = useState(0);
  const word = WORDS[round % WORDS.length];
  const guess = used.map((i) => tiles[i].ch).join("");
  const solved = guess === word;
  const wrong = guess.length === word.length && !solved;
  const next = () => {
    const r = round + 1;
    setRound(r);
    setTiles(scramble(WORDS[r % WORDS.length]));
    setUsed([]);
  };
  const tap = (i) => {
    if (used.includes(i) || solved) return;
    const nu = [...used, i];
    setUsed(nu);
    if (nu.map((k) => tiles[k].ch).join("") === word) setScore((s) => s + 1);
  };
  return (
    <GameFrame id="word-scramble" hint="Tap the letters in order to spell an uplifting word." status={solved ? `Yes — ${word}! Words found: ${score}` : wrong ? "Not quite — clear and try again." : `Words found: ${score}`}>
      <div data-testid="scramble-guess" className="mx-auto flex justify-center gap-1.5 min-h-12">
        {word.split("").map((_, i) => <span key={i} className={`h-11 w-10 rounded-lg border-2 grid place-items-center font-bold ${solved ? "border-eq bg-eq-soft text-eq-dark" : "border-eq/20"}`}>{guess[i] || ""}</span>)}
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {tiles.map((t, i) => (
          <button key={i} data-testid={`scramble-tile-${i}`} onClick={() => tap(i)} disabled={used.includes(i)}
            className="h-11 w-10 rounded-lg bg-eq text-white font-bold disabled:opacity-25">{t.ch}</button>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {!solved && <Btn data-testid="scramble-clear" onClick={() => setUsed([])} className="bg-white border border-eq/30 text-eq-dark hover:bg-eq-soft">Clear</Btn>}
        <Btn data-testid="scramble-next" onClick={next}>{solved ? "Next word" : "Skip"}</Btn>
      </div>
    </GameFrame>
  );
};
