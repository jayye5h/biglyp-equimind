import { motion, AnimatePresence } from "framer-motion";
import { STAGES, stageSrc } from "@/lib/stages";
import { useBrand } from "@/lib/theme";

/** Progress avatar: shows the student's growth stage (1-14). Stages only move forward. */
export const Student = ({ stage = 1, bounce, dim, size = "h-44 w-44", testid = "student-avatar", programme }) => {
  const B = useBrand();
  const s0 = STAGES[Math.max(1, Math.min(14, stage)) - 1];
  const s = { ...s0, src: stageSrc(s0.n, programme || B?.key) };
  return (
    <motion.div data-testid={testid} data-stage={s.n} className={`relative mx-auto ${size}`}
      animate={bounce ? { y: [0, -12, 0], scale: [1, 1.05, 1] } : { y: 0 }} transition={{ duration: 0.6 }}>
      <div className={`absolute inset-0 rounded-full bg-eq-soft overflow-hidden ring-1 ring-eq/10 ${dim ? "opacity-45 grayscale-[60%]" : ""}`}>
        <AnimatePresence initial={false}>
          <motion.img key={s.n} src={s.src} alt={`Progress avatar: ${s.caption}`} draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
