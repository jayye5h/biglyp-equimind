import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, CalendarDays, Sun, Sprout, Clock, Leaf, Activity, Smile, Frown, Annoyed, Meh, Laugh } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Student } from "@/components/Avatar";
import { elapsedDays } from "@/lib/progress";
import { currentStage, STAGES, phaseOf } from "@/lib/stages";

const MOODS = [
  { v: 0, l: "Struggling", icon: Frown }, { v: 1, l: "Rough", icon: Annoyed }, { v: 2, l: "Mixed", icon: Meh },
  { v: 3, l: "Steady", icon: Smile }, { v: 4, l: "Strong", icon: Laugh },
];
const BASE = [0.18, 0.32, 0.48, 0.62, 0.74];

const COPY = {
  "b-wake": ["Let's keep going together.", "A small, consistent routine can make a big difference.", "Did you wake up at your fixed time today?", "A consistent routine can help you feel more focused and less stressed."],
  "b-phone": ["Sleep is where you recharge.", "Putting the phone away protects the rest you need.", "Did your phone sleep across the room last night?", "Less late-night scrolling usually means deeper, longer sleep."],
  "b-dump": ["Let's clear the mind.", "Putting thoughts on paper makes space to rest.", "Did you write a 5-minute brain dump before bed?", "Getting worries out of your head helps you switch off."],
  "a-10min": ["Small starts, big wins.", "The hardest part is usually just beginning.", "Did you do a 10-minute start on a task you were avoiding?", "Ten minutes is enough to break the avoidance loop."],
  "a-top3": ["Focus on what matters.", "Three clear tasks beat a vague pile of everything.", "Did you write your morning top-3 today?", "A short list keeps the day doable."],
  "d-honest": ["A little connection goes a long way.", "Sharing even one honest thought can feel lighter and more supportive.", "Did you share one honest sentence with someone today?", "It could be how you felt, something on your mind, or just a real thought."],
  "c-breath": ["Let's take a moment to slow down.", "A simple breathing exercise can help you feel calmer and more in control.", "Did you try the 4-7-8 breathing when things got tense today?", "It's a simple exercise that can help you feel calmer, more relaxed and think more clearly."],
  "e-three": ["Every small effort deserves recognition.", "Noticing what you did, even the small things, can build a more positive mind.", "Did you write your three-things-I-did list today?", "It's a simple way to notice your efforts, feel more positive and end the day on a good note."],
  "c-checkin": ["Let's pause and check in with ourselves.", "A quick check-in can help you understand your stress levels and how you're feeling.", "Did you do your 60-second pause today?", "It's a short check-in to understand your stress and name one feeling, which can help you feel more balanced."],
  "f-money": ["One conversation at a time.", "Talking it through usually shrinks the worry to its real size.", "Did you take a step towards your money conversation today?", "Even planning when to talk counts as a step."],
};
const copyFor = (a) => COPY[a.id] || ["Keep going.", "Every small step counts.", `Did you do "${a.name}" today?`, a.when || ""];

const partOfDay = () => { const h = new Date().getHours(); return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening"; };

const Decor = () => (
  <>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-eq-soft/70 to-transparent" />
    <Leaf className="pointer-events-none absolute bottom-3 left-3 h-12 w-12 text-eq/25 -rotate-12" strokeWidth={1.2} />
    <Sprout className="pointer-events-none absolute bottom-3 right-3 h-12 w-12 text-eq/25" strokeWidth={1.2} />
  </>
);

const AvatarRing = ({ stage, bounce, sparkle, children }) => (
  <div className="relative mx-auto w-fit">
    <Leaf className="absolute -left-5 bottom-3 h-9 w-9 text-emerald-400/70 -rotate-45" />
    <Leaf className="absolute -right-5 bottom-3 h-9 w-9 text-emerald-400/70 rotate-45 scale-x-[-1]" />
    {sparkle && <motion.div className="absolute -right-2 top-1 text-eq font-bold" animate={{ opacity: [0.3, 1, 0.3], rotate: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>✦</motion.div>}
    <Student key={bounce} stage={stage} bounce={bounce > 0} size="h-32 w-32 sm:h-36 sm:w-36" testid="daily-log-avatar" />
    {children}
  </div>
);

const Dots = ({ n, total }) => (
  <div data-testid="daily-log-progress" className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white shadow px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
    {n}/{total}{Array.from({ length: total }, (_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i < n ? "bg-eq" : "bg-slate-200"}`} />)}
  </div>
);

const MoodStep = ({ todayNo, mood, glow, stage, setMood, onNext, onLater }) => (
  <div className="text-center">
    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Good to see you again!</h2>
    <p className="mt-1 text-sm text-slate-500">Let&apos;s take another small step together.</p>
    <div className="mt-5"><AvatarRing stage={stage} /></div>
    <p data-testid="daily-log-stage" className="mt-3 text-xs text-slate-500">Phase {phaseOf(stage).n} · {phaseOf(stage).name} — <span className="font-medium text-eq-dark">{STAGES[stage - 1].caption}</span></p>
    <div data-testid="daily-log-glow" className="mt-5 mx-auto max-w-sm rounded-full bg-white shadow-sm px-4 py-2 flex items-center gap-3 text-xs text-slate-600">
      <Sun className="h-4 w-4 text-amber-500" /> Your Glow
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><motion.div className="h-full bg-eq rounded-full" animate={{ width: `${glow * 100}%` }} /></div>
      <Sprout className="h-4 w-4 text-emerald-500" /> {partOfDay()}
    </div>
    <h3 className="mt-6 font-serif text-xl font-bold text-slate-900">How are you feeling today?</h3>
    <p className="text-sm text-slate-500">Tap the one that feels closest to you right now.</p>
    <div className="mt-4 grid grid-cols-5 gap-2">
      {MOODS.map((m) => (
        <button key={m.v} data-testid={`daily-mood-${m.v}`} onClick={() => setMood(m.v)}
          className={`rounded-2xl border py-3 flex flex-col items-center gap-1.5 text-[11px] sm:text-xs transition-colors ${mood === m.v ? "border-eq bg-eq-soft text-eq-dark font-semibold" : "border-slate-200 bg-white text-slate-600 hover:border-eq/40"}`}>
          <m.icon className="h-6 w-6" strokeWidth={1.6} />{m.l}
        </button>
      ))}
    </div>
    <button data-testid="daily-log-continue-btn" disabled={mood === null} onClick={onNext} className="mt-6 h-12 w-full max-w-xs rounded-full bg-eq text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-eq-dark disabled:opacity-40 transition-colors">Continue <ArrowRight className="h-4 w-4" /></button>
    <button data-testid="daily-checkin-later-btn" onClick={onLater} className="mt-3 mx-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"><Clock className="h-3.5 w-3.5" /> Remind me later</button>
    <span className="sr-only">Day {todayNo}</span>
  </div>
);

const ActivityStep = ({ a, idx, total, answer, stage, bounce, onAnswer, onBack, onNext, note, setNote }) => {
  const [head, sub, q, desc] = copyFor(a);
  const last = idx === total - 1;
  return (
    <div className="text-center">
      <h2 data-testid="daily-log-heading" className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">{head}</h2>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
      <div className="mt-5"><AvatarRing stage={stage} bounce={bounce} sparkle><Dots n={idx + 1} total={total} /></AvatarRing></div>
      <div className="relative mt-8 rounded-3xl bg-white/90 shadow-sm border border-eq/10 p-5 sm:p-6">
        <p data-testid="daily-checkin-question" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{q}</p>
        <p className="mt-2 text-sm text-slate-500">{desc}</p>
        {a.id === "c-checkin" && (
          <div className="mt-4 rounded-2xl bg-eq-bg p-3 grid grid-cols-2 gap-3 text-left text-xs">
            <label className="flex items-center gap-2"><Activity className="h-4 w-4 text-eq shrink-0" /><span className="flex-1">Rate your stress (0–10)<input data-testid="daily-stress-input" type="number" min={0} max={10} value={note.stress ?? ""} onChange={(e) => setNote({ ...note, stress: e.target.value === "" ? undefined : Math.max(0, Math.min(10, Number(e.target.value))) })} className="mt-1 w-full h-8 rounded-lg bg-white px-2 outline-none focus:ring-2 focus:ring-eq" /></span></label>
            <label className="flex items-center gap-2 border-l border-slate-200 pl-3"><Smile className="h-4 w-4 text-eq shrink-0" /><span className="flex-1">Name one feeling<input data-testid="daily-feeling-input" maxLength={30} placeholder="e.g. calm, anxious, hopeful" value={note.feeling || ""} onChange={(e) => setNote({ ...note, feeling: e.target.value })} className="mt-1 w-full h-8 rounded-lg bg-white px-2 outline-none focus:ring-2 focus:ring-eq" /></span></label>
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button data-testid="daily-checkin-yes-btn" onClick={() => onAnswer(true)} className={`h-12 rounded-2xl font-medium inline-flex items-center justify-center gap-2 transition-colors ${answer === true ? "bg-eq-dark text-white ring-2 ring-offset-2 ring-eq" : "bg-eq text-white hover:bg-eq-dark"}`}><Check className="h-4 w-4" /> Yes, I did</button>
          <button data-testid="daily-checkin-no-btn" onClick={() => onAnswer(false)} className={`h-12 rounded-2xl font-medium border transition-colors ${answer === false ? "border-eq bg-eq-soft text-eq-dark" : "border-eq/30 text-eq-dark hover:bg-eq-bg"}`}>Not this time</button>
        </div>
      </div>
      <div className="relative mt-5 flex items-center justify-between">
        <button data-testid="daily-log-back-btn" onClick={onBack} className="text-sm font-medium text-eq inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</button>
        {last ? (
          <button data-testid="daily-checkin-save-btn" disabled={answer === undefined} onClick={onNext} className="h-10 px-5 rounded-full bg-eq text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-40">Submit today&apos;s check-in <ArrowRight className="h-4 w-4" /></button>
        ) : (
          <button data-testid="daily-log-next-btn" disabled={answer === undefined} onClick={onNext} className="text-sm font-medium text-eq inline-flex items-center gap-1.5 disabled:opacity-40">Next activity <ArrowRight className="h-4 w-4" /></button>
        )}
      </div>
    </div>
  );
};

export const DailyLog = ({ r, day, open, onClose, onSave }) => {
  const todayIdx = Math.min(elapsedDays(r), 13);
  const [step, setStep] = useState(-1);
  const [mood, setMood] = useState((r.moods || {})[todayIdx] ?? null);
  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState({});
  const [bounce, setBounce] = useState(0);
  const yes = Object.values(answers).filter(Boolean).length;
  const no = Object.values(answers).length - yes;
  const glow = Math.max(0.1, Math.min(1, (mood === null ? 0.45 : BASE[mood]) + yes * 0.06 - no * 0.04));
  const total = r.plan.length;
  const stage = currentStage(r);

  const answer = (v) => {
    setAnswers({ ...answers, [step]: v });
    if (v) setBounce((b) => b + 1);
  };
  const submit = () => {
    const ticks = new Set(r.ticks || []);
    r.plan.forEach((_, i) => (answers[i] ? ticks.add(`${i}-${day}`) : ticks.delete(`${i}-${day}`)));
    const patch = { ticks: [...ticks], logged_days: [...new Set([...(r.logged_days || []), day])], moods: { ...(r.moods || {}), [todayIdx]: mood } };
    if (note.stress !== undefined || note.feeling) patch.daily_notes = { ...(r.daily_notes || {}), [day]: note };
    onSave(patch);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent data-testid="daily-checkin-dialog" className="w-[calc(100%-1.5rem)] max-w-lg max-h-[94vh] overflow-y-auto rounded-[2rem] p-5 sm:p-8 bg-gradient-to-b from-white to-eq-bg border-eq/10">
        <Decor />
        <DialogTitle className="sr-only">Daily activity log</DialogTitle>
        <DialogDescription className="sr-only">Log your mood and today&apos;s plan activities</DialogDescription>
        <div className="relative">
          <div className="flex justify-center"><span data-testid="daily-log-day-badge" className="rounded-full bg-eq-soft text-eq-dark text-xs font-semibold px-3 py-1 inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Day {todayIdx + 1} of 14</span></div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="mt-4">
              {step < 0 ? (
                <MoodStep todayNo={todayIdx + 1} mood={mood} glow={glow} stage={stage} setMood={setMood} onNext={() => setStep(0)} onLater={onClose} />
              ) : (
                <ActivityStep a={r.plan[step]} idx={step} total={total} answer={answers[step]} stage={stage} bounce={bounce} onAnswer={answer}
                  onBack={() => setStep(step - 1)} onNext={step === total - 1 ? submit : () => setStep(step + 1)} note={note} setNote={setNote} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
