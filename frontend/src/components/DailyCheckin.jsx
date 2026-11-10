import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Student, MoodMeter, SceneProp, sceneFor } from "@/components/StudentAnimation";
import { elapsedDays } from "@/lib/progress";
import { currentStage } from "@/lib/stages";

export const pendingDay = (r) => {
  const e = elapsedDays(r);
  if (e < 1 || e > 15) return null;
  const d = Math.min(e - 1, 13);
  return (r.logged_days || []).includes(d) ? null : d;
};

const START = 0.45;

export const DailyCheckin = ({ r, day, open, onClose, onSave }) => {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [bounce, setBounce] = useState(0);
  const yes = Object.values(answers).filter(Boolean).length;
  const no = Object.values(answers).length - yes;
  const mood = Math.max(0.1, Math.min(1, START + yes * 0.11 - no * 0.06));
  const done = step >= r.plan.length;
  const act = r.plan[step];
  const scene = act ? sceneFor(act) : null;

  const answer = (v) => {
    setAnswers({ ...answers, [step]: v });
    if (v) setBounce((b) => b + 1);
    setTimeout(() => setStep((s) => s + 1), 650);
  };

  const finish = () => {
    const ticks = new Set(r.ticks || []);
    r.plan.forEach((_, i) => (answers[i] ? ticks.add(`${i}-${day}`) : ticks.delete(`${i}-${day}`)));
    onSave({ ticks: [...ticks], logged_days: [...new Set([...(r.logged_days || []), day])] });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent data-testid="daily-checkin-dialog" className="w-[calc(100%-2rem)] max-w-md rounded-[2rem] p-6 sm:p-8 overflow-hidden">
        <DialogTitle className="font-serif text-2xl text-center">{done ? "Day " + (day + 1) + " logged" : step < 0 ? `How did Day ${day + 1} go?` : `Activity ${step + 1} of ${r.plan.length}`}</DialogTitle>
        <DialogDescription className="text-center text-sm text-slate-500 -mt-1">{step < 0 ? "Five quick taps on yesterday's plan. Watch your student light up." : done ? `You did ${yes} of ${r.plan.length} activities.` : act.name}</DialogDescription>
        <div className="relative mt-2">
          <Student key={bounce} stage={currentStage(r)} bounce={bounce > 0} />
          {scene && !done && <SceneProp scene={scene} />}
        </div>
        <MoodMeter mood={mood} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="mt-6 text-center">
            {step < 0 && <button data-testid="daily-checkin-start-btn" onClick={() => setStep(0)} className="h-12 px-7 rounded-2xl bg-eq text-white font-medium hover:bg-eq-dark transition-colors">Let&apos;s go</button>}
            {act && !done && (
              <>
                <p data-testid="daily-checkin-question" className="font-serif text-xl text-slate-900 leading-snug">{scene.q}</p>
                <div className="mt-5 flex justify-center gap-3">
                  <button data-testid="daily-checkin-no-btn" disabled={answers[step] !== undefined} onClick={() => answer(false)} className="h-12 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:border-slate-400 inline-flex items-center gap-2 transition-colors disabled:opacity-50"><X className="h-4 w-4" /> Not today</button>
                  <button data-testid="daily-checkin-yes-btn" disabled={answers[step] !== undefined} onClick={() => answer(true)} className="h-12 px-6 rounded-2xl bg-eq text-white hover:bg-eq-dark inline-flex items-center gap-2 transition-colors disabled:opacity-50"><Check className="h-4 w-4" /> Yes, I did</button>
                </div>
              </>
            )}
            {done && (
              <>
                <p className="text-slate-600 text-sm">{yes >= 4 ? "Brilliant day. Your student is beaming." : yes >= 2 ? "Good effort — small steps count." : "Tough day. Tomorrow is the restart, not next Monday."}</p>
                <button data-testid="daily-checkin-save-btn" onClick={finish} className="mt-5 h-12 px-7 rounded-2xl bg-eq text-white font-medium hover:bg-eq-dark transition-colors">Save to my plan</button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        {step < 0 && <button data-testid="daily-checkin-later-btn" onClick={onClose} className="mt-2 mx-auto block text-xs text-slate-400 hover:text-slate-700">Remind me later</button>}
      </DialogContent>
    </Dialog>
  );
};
