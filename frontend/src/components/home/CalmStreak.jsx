import { Sprout, Leaf, Sun, Feather, Flower2, Star, Mountain, Waves, Heart, Sparkles, Rainbow, Moon, Gem, Trophy, Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { elapsedDays } from "@/lib/progress";

export const BADGES = [
  { icon: Sprout, name: "First Step", msg: "You showed up for yourself. Every journey starts exactly like this." },
  { icon: Leaf, name: "Two in a Row", msg: "Two days of caring for you. A lovely habit is taking root." },
  { icon: Sun, name: "Bright Start", msg: "Three days strong — you're building real momentum." },
  { icon: Feather, name: "Lighter Steps", msg: "Four check-ins. Notice how much lighter small steps feel now." },
  { icon: Flower2, name: "Blooming", msg: "Five days of showing up. You are growing, gently and surely." },
  { icon: Star, name: "Shining Through", msg: "Six days! Your consistency is something to be proud of." },
  { icon: Mountain, name: "Week One Wonder", msg: "A whole week. You climbed it one small step at a time." },
  { icon: Waves, name: "Steady Flow", msg: "Eight days — calm habits are becoming part of you." },
  { icon: Heart, name: "Kind to Myself", msg: "Nine days of kindness towards yourself. You deserve every one." },
  { icon: Sparkles, name: "Double Digits", msg: "Ten days! That's real commitment to your wellbeing." },
  { icon: Rainbow, name: "Through It All", msg: "Eleven days — through good days and hard ones, you kept going." },
  { icon: Moon, name: "Calm Keeper", msg: "Twelve days. You know how to look after your calm now." },
  { icon: Gem, name: "Rare Strength", msg: "Thirteen days of steady care. That's a rare and beautiful strength." },
  { icon: Trophy, name: "Journey Complete", msg: "Fourteen days! You finished your journey — believe in what you just proved." },
];

export const streakInfo = (r) => {
  const logged = new Set(r?.logged_days || []);
  const e = r ? elapsedDays(r) : 0;
  const cur = Math.min(e - 1, 13);
  let current = 0;
  for (let d = logged.has(cur) ? cur : cur - 1; d >= 0 && logged.has(d); d--) current++;
  let best = 0, run = 0;
  for (let d = 0; d < 14; d++) { run = logged.has(d) ? run + 1 : 0; best = Math.max(best, run); }
  return { logged, current, best, cur, earned: logged.size };
};

const cheer = (s) => {
  if (s.cur < 0) return "Your first badge unlocks with tomorrow's daily check-in. Something lovely to look forward to.";
  if (s.earned >= 14) return "You collected every badge. What a journey — be proud of yourself.";
  if (s.current >= 7) return "You're on a beautiful run. Keep this gentle rhythm going.";
  if (s.current >= 3) return "You're building real momentum. One more check-in keeps your streak glowing.";
  if (s.current >= 1) return "Lovely start! Check in again tomorrow to grow your streak.";
  if (s.earned) return "Missed a day? That's okay. Your badges are safe — a new streak can begin today.";
  return "Complete today's check-in to earn your first badge.";
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
          <div className="rounded-2xl bg-eq-bg/70 px-4 py-2 text-center"><div data-testid="streak-earned" className="font-serif text-2xl font-bold text-slate-800 leading-none">{s.earned}<span className="text-sm text-slate-400">/14</span></div><div className="mt-1 text-[11px] text-slate-500">badges</div></div>
          {pending !== null && <button data-testid="streak-checkin-btn" onClick={onOpenDaily} className="hidden md:inline-flex h-11 px-4 rounded-xl bg-eq text-white text-sm font-medium items-center hover:bg-eq-dark transition-colors">Check in now</button>}
        </div>
      </div>
      <TooltipProvider delayDuration={100}>
        <div className="mt-6 grid grid-cols-7 lg:grid-cols-[repeat(14,minmax(0,1fr))] gap-2 sm:gap-3">
          {BADGES.map((b, i) => {
            const got = s.logged.has(i);
            const next = !got && i === (s.logged.has(s.cur) ? s.cur + 1 : s.cur);
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <button data-testid={`streak-badge-${i + 1}`} data-earned={got} aria-label={`Day ${i + 1}: ${b.name}`}
                    className={`group flex flex-col items-center gap-1.5 focus:outline-none`}>
                    <span className={`relative h-11 w-11 sm:h-12 sm:w-12 rounded-full grid place-items-center transition-transform duration-300 group-hover:-translate-y-0.5 ${got ? "bg-eq text-white shadow-[0_6px_16px_-6px_rgb(var(--eq-p)/0.7)]" : next ? "bg-white text-eq border-2 border-dashed border-eq/50" : "bg-slate-50 text-slate-300 border border-slate-100"}`}>
                      <b.icon className="h-5 w-5" />
                    </span>
                    <span className={`text-[10px] font-medium ${got ? "text-eq-dark" : "text-slate-400"}`}>Day {i + 1}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-center">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs opacity-80">{got ? b.msg : next ? "Your next badge — just one check-in away." : "Waiting for you along the journey."}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      <p className="mt-4 text-xs text-slate-500">Best streak: <span data-testid="streak-best" className="font-semibold text-slate-700">{s.best} {s.best === 1 ? "day" : "days"}</span> · Earn a badge for each day you complete your daily check-in.</p>
    </section>
  );
};
