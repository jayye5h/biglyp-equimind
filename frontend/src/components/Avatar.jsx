import { motion, AnimatePresence } from "framer-motion";

export const moodIndex = (m) => (m < 0.25 ? 0 : m < 0.42 ? 1 : m < 0.6 ? 2 : m < 0.8 ? 3 : 4);

const Zzz = () => (
  <div className="absolute -top-1 right-1 pointer-events-none">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} className="absolute font-serif font-bold text-eq" style={{ fontSize: 14 + i * 5, right: i * 12 }}
        initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -40 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }}>z</motion.span>
    ))}
  </div>
);

export const Student = ({ mood, sleeping, bounce, size = "h-44 w-44", testid = "student-avatar" }) => {
  const m = Math.max(0, Math.min(1, mood));
  const idx = sleeping ? 2 : moodIndex(m);
  return (
    <motion.div data-testid={testid} data-mood={m.toFixed(2)} data-face={idx} className={`relative mx-auto ${size}`}
      animate={bounce ? { y: [0, -12, 0], scale: [1, 1.05, 1] } : { y: 0 }} transition={{ duration: 0.6 }}>
      <div className="absolute inset-0 rounded-full bg-eq-soft overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img key={idx} src={`/avatars/mood${idx}.webp`} alt="Your student avatar" draggable={false}
            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} />
        </AnimatePresence>
      </div>
      {sleeping && <Zzz />}
    </motion.div>
  );
};
