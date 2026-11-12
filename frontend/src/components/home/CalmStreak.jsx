import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { elapsedDays } from "@/lib/progress";
import { PHASES, STAGES, currentStage, toNextStage, PER_STAGE, stageSrc } from "@/lib/stages";

export const BADGES = [
  { name: "First Step", msg: "You showed up for yourself. Every journey starts exactly like this." },
  { name: "Finding Calm", msg: "A little calmer already. Small steps are quietly working." },
  { name: "Balanced", msg: "You're finding your balance \u2014 a lovely habit is taking root." },
  { name: "Focused", msg: "Your focus is growing. Notice how much lighter small steps feel now." },
  { name: "Bright Mind", msg: "Calmer and more positive \u2014 you are growing, gently and surely." },
  { name: "Energised", msg: "Your energy is rising. Your consistency is something to be proud of." },
  { name: "Confident", msg: "Feeling good and more confident \u2014 you earned this, one step at a time." },
  { name: "Lighter", msg: "Lighter and more active. Calm habits are becoming part of you." },
  { name: "Good Company", msg: "Enjoying time with people again. You are worth knowing." },
  { name: "Connected", msg: "Feeling more connected \u2014 that's real growth." },
  { name: "In Tune", msg: "Enjoying the things you love again. Keep that music playing." },
  { name: "Expressive", msg: "More expressive and lively \u2014 the real you is shining through." },
  { name: "Self-Assured", msg: "More social and self-assured. That's a rare and beautiful strength." },
  { name: "Ready for What's Next", msg: "Confident, happy and ready \u2014 believe in what you just proved." },
];

export const streakInfo = (r) => {
  const logged = new Set(r?.logged_days || []);
  const e = r ? elapsedDays(r) : 0;
  const cur = r ? Math.min(e, 13) : -1;
  let current = 0;
  for (let d = logged.has(cur) ? cur : cur - 1; d >= 0 && logged.has(d); d--) current++;
  let best = 0, run = 0;
  for (let d = 0; d < 14; d++) { run = logged.has(d) ? run + 1 : 0; best = Math.max(best, run); }
  return { logged, current, best, cur, earned: logged.size, stage: currentStage(r), over: e > 15 };
};

const cheer = (s) => {
  if (s.cur < 0) return "Your journey has begun. Complete your plan activities to grow into your next stage — something lovely to look forward to.";
  if (s.over) return "Your 14-day journey is complete. Take a New Assessment whenever you are ready for the next chapter.";
  if (s.stage >= 14) return "You reached the final stage. What a journey — be proud of yourself.";
  if (s.current >= 7) return "You're on a beautiful run. Keep this gentle rhythm going.";
  if (s.current >= 3) return "You're building real momentum. One more check-in keeps your streak glowing.";
  if (s.current >= 1) return "Lovely start! Check in again tomorrow to grow your streak.";
  if (s.earned) return "Missed a day? That's okay. Your progress is safe — you never move backwards. A new streak can begin today.";
  return "Complete today's plan activities to grow into your next stage.";
};

export const StreakCard = ({ r, onOpenDaily, pending }) => {
  const s = streakInfo(r);
  return (
    <section data-testid="calm-streak-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <span className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-eq-soft to-white border border-eq/15 grid place-items-center"><Flame className="h-7 w-7 text-eq" /></span>
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Calm Streak</h2>
            <p data-testid="streak-cheer" className="text-sm text-slate-600 max-w-md">{cheer(s)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-eq-bg/70 px-4 py-2 text-center"><div data-testid="streak-current" className="font-serif text-2xl font-bold text-eq-dark leading-none">{s.current}</div><div className="mt-1 text-[11px] text-slate-500">day streak</div></div>
          <div className="rounded-2xl bg-eq-bg/70 px-4 py-2 text-center"><div data-testid="streak-earned" className="font-serif text-2xl font-bold text-slate-800 leading-none">{s.stage}<span className="text-sm text-slate-400">/14</span></div><div className="mt-1 text-[11px] text-slate-500">stage</div></div>
          {pending !== null && <button data-testid="streak-checkin-btn" onClick={onOpenDaily} className="hidden md:inline-flex h-11 px-4 rounded-xl bg-eq text-white text-sm font-medium items-center hover:bg-eq-dark transition-colors">Check in now</button>}
        </div>
      </div>
      <div className="mt-6 hidden lg:grid grid-cols-[repeat(14,minmax(0,1fr))] gap-3 mb-3">
        {PHASES.map((p) => (
          <div key={p.n} title={`Phase ${p.n}: ${p.name}`} style={{ gridColumn: `span ${p.to - p.from + 1}` }}
            className={`rounded-full px-3 py-1.5 text-center text-[11px] font-semibold truncate ${p.n % 2 ? "bg-eq-soft text-eq-dark" : "bg-violet-50 text-violet-700"} ${s.stage >= p.from ? "" : "opacity-50"}`}>
            Phase {p.n} · {p.short}
          </div>
        ))}
      </div>
      <TooltipProvider delayDuration={100}>
        <div className="mt-6 lg:mt-0 grid grid-cols-7 lg:grid-cols-[repeat(14,minmax(0,1fr))] gap-2 sm:gap-3">
          {BADGES.map((b, i) => {
            const got = i < s.stage;
            const next = i === s.stage;
            const st = STAGES[i];
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <button data-testid={`streak-badge-${i + 1}`} data-earned={got} aria-label={`${b.name}: ${st.caption}`}
                    className="group flex flex-col items-center focus:outline-none">
                    <span className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-0.5 ${got ? "ring-2 ring-eq shadow-[0_6px_16px_-6px_rgb(var(--eq-p)/0.7)]" : next ? "outline-dashed outline-2 outline-eq/50 outline-offset-2" : "ring-1 ring-slate-200"}`}>
                      <img src={stageSrc(st.n, r?.programme)} alt={st.caption} draggable={false} className={`h-full w-full object-cover ${got ? "" : "grayscale opacity-40"}`} />
                    </span>
                    <span className={`mt-1.5 h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold grid place-items-center ${got ? "bg-eq text-white" : "bg-slate-100 text-slate-400"}`}>{i + 1}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-center">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs font-medium">{st.caption}</p>
                  <p className="mt-0.5 text-xs opacity-80">{got ? b.msg : next ? `Your next stage — ${toNextStage(r)} more ${toNextStage(r) === 1 ? "activity" : "activities"} to go.` : "Waiting for you along the journey."}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      <p className="mt-4 text-xs text-slate-500">Best streak: <span data-testid="streak-best" className="font-semibold text-slate-700">{s.best} {s.best === 1 ? "day" : "days"}</span> · Every {PER_STAGE} plan activities you complete unlock your next growth stage — you only ever move forward.</p>
    </section>
  );
};
