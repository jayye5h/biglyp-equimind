import { motion, AnimatePresence } from "framer-motion";
export { Student } from "@/components/Avatar";
import { Smartphone, NotebookPen, Timer, MessageCircleHeart, HeartPulse, Sparkles, Sun, Moon, ListChecks, Wallet } from "lucide-react";

export const SCENES = {
  "b-wake": { q: "Did you wake up at your fixed time today?", icon: Sun, sleep: true },
  "b-phone": { q: "Did your phone sleep across the room last night?", icon: Smartphone, anim: { x: [0, 26, 0], rotate: [0, 12, 0] } },
  "b-dump": { q: "Did you write a 5-minute brain dump before bed?", icon: NotebookPen, anim: { rotate: [-8, 8, -8] } },
  "b-daylight": { q: "Did you get some daylight within 30 minutes of waking?", icon: Sun, anim: { scale: [1, 1.2, 1] } },
  "a-10min": { q: "Did you do a 10-minute start on a task you were avoiding?", icon: Timer, anim: { rotate: [0, 360] } },
  "a-top3": { q: "Did you write your morning top-3?", icon: ListChecks, anim: { y: [0, -6, 0] } },
  "a-focus": { q: "Did you do your two 25-minute focus blocks?", icon: Timer, anim: { rotate: [0, 360] } },
  "c-checkin": { q: "Did you do your 60-second check-in?", icon: HeartPulse, anim: { scale: [1, 1.25, 1] } },
  "c-breath": { q: "Did you try 4-7-8 breathing when things got tense?", icon: Sparkles, anim: { scale: [1, 1.35, 1] } },
  "d-honest": { q: "Did you share one honest sentence with someone?", icon: MessageCircleHeart, anim: { scale: [1, 1.15, 1], y: [0, -4, 0] } },
  "e-three": { q: "Did you write your three-things-I-did list?", icon: ListChecks, anim: { y: [0, -6, 0] } },
  "f-money": { q: "Did you take a step towards your money conversation?", icon: Wallet, anim: { y: [0, -6, 0] } },
};

export const sceneFor = (a) => SCENES[a.id] || { q: `Did you do "${a.name}" today?`, icon: Sparkles, anim: { y: [0, -6, 0] } };

const Zzz = () => (
  <div className="absolute -top-2 right-2 pointer-events-none">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} className="absolute font-serif font-bold text-eq" style={{ fontSize: 14 + i * 5, right: i * 12 }}
        initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -40 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }}>z</motion.span>
    ))}
  </div>
);

const StudentSvgLegacy = ({ mood, sleeping, bounce, size = "h-44 w-44", testid = "student-avatar" }) => {
  const m = Math.max(0, Math.min(1, mood));
  const mouth = `M46 84 Q60 ${84 + (m - 0.5) * 26} 74 84`;
  const sad = Math.max(0, (0.5 - m) * 9);
  const lift = Math.max(0, (m - 0.5) * 4);
  const bg = `hsl(${200 + m * 20}, ${40 + m * 40}%, ${88 - m * 6}%)`;
  return (
    <motion.div data-testid={testid} data-mood={m.toFixed(2)} className={`relative mx-auto ${size}`}
      animate={bounce ? { y: [0, -14, 0], scale: [1, 1.05, 1] } : { y: 0 }} transition={{ duration: 0.6 }}>
      <motion.div className="absolute inset-0 rounded-full" animate={{ backgroundColor: bg }} transition={{ duration: 0.6 }} />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <path d="M28 120 Q30 98 60 96 Q90 98 92 120 Z" fill="rgb(var(--eq-p))" />
        <circle cx="60" cy="62" r="30" fill="#f4cfae" />
        <path d="M30 58 Q32 28 60 28 Q88 28 90 58 Q80 42 60 42 Q40 42 30 58 Z" fill="#2b2b3a" />
        <rect x="38" y="20" width="44" height="7" rx="2" fill="#1b1e3d" />
        <path d="M60 14 L86 22 L60 30 L34 22 Z" fill="#1b1e3d" />
        <motion.line x1="44" x2="54" stroke="#2b2b3a" strokeWidth="2.4" strokeLinecap="round" animate={{ y1: 52 - lift + sad * 0.3, y2: 52 - lift - sad }} />
        <motion.line x1="66" x2="76" stroke="#2b2b3a" strokeWidth="2.4" strokeLinecap="round" animate={{ y1: 52 - lift - sad, y2: 52 - lift + sad * 0.3 }} />
        {sleeping ? (
          <g stroke="#2b2b3a" strokeWidth="2.4" fill="none" strokeLinecap="round"><path d="M44 64 Q49 68 54 64" /><path d="M66 64 Q71 68 76 64" /></g>
        ) : (
          <g fill="#2b2b3a"><circle cx="49" cy="64" r="3.4" /><circle cx="71" cy="64" r="3.4" /></g>
        )}
        <motion.circle cx="42" cy="74" r="5" fill="#f87171" animate={{ opacity: m * 0.55 }} />
        <motion.circle cx="78" cy="74" r="5" fill="#f87171" animate={{ opacity: m * 0.55 }} />
        <motion.path d={mouth} stroke="#2b2b3a" strokeWidth="2.6" fill="none" strokeLinecap="round" animate={{ d: mouth }} transition={{ duration: 0.5 }} />
        <AnimatePresence>{m < 0.28 && !sleeping && <motion.path key="tear" d="M74 70 Q76 76 74 78 Q72 76 74 70 Z" fill="#60a5fa" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 2 }} exit={{ opacity: 0 }} />}</AnimatePresence>
      </svg>
      {sleeping && <Zzz />}
      {sleeping && <Moon className="absolute top-2 left-2 h-6 w-6 text-slate-400" />}
    </motion.div>
  );
};

export const MoodMeter = ({ mood }) => (
  <div data-testid="mood-meter" className="mx-auto mt-4 w-56">
    <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400"><span>Low</span><span>Mood meter</span><span>Bright</span></div>
    <div className="mt-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <motion.div className="h-full rounded-full" animate={{ width: `${Math.max(6, mood * 100)}%`, backgroundColor: mood < 0.35 ? "#f07167" : mood < 0.6 ? "#fbbf24" : "rgb(var(--eq-p))" }} transition={{ duration: 0.5 }} />
    </div>
  </div>
);

export const SceneProp = ({ scene }) => {
  const Icon = scene.icon;
  if (scene.sleep) return null;
  return (
    <motion.div className="absolute -right-2 top-6 h-12 w-12 rounded-2xl bg-white shadow-md grid place-items-center" animate={scene.anim} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
      <Icon className="h-6 w-6 text-eq" />
    </motion.div>
  );
};
