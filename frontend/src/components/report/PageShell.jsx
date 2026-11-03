import { Mountain, Waves, Moon, Sun, Leaf, Cloud, Sprout, Feather, Wind, Flower2, Star } from "lucide-react";

const MOTIFS = [Sun, Mountain, Waves, Leaf, Sprout, Feather, Moon, Cloud, Wind, Flower2, Star];

export const PageShell = ({ n, total, title, eyebrow, id, children, dark, testid }) => {
  const Motif = MOTIFS[(n - 1) % MOTIFS.length];
  return (
    <section id={id} data-pdf-page data-testid={testid}
      className={`relative overflow-hidden rounded-[2rem] p-7 sm:p-10 border scroll-mt-24 ${dark ? "bg-[#1b1e3d] text-white border-transparent" : "bg-white border-[#2d8a7c]/10"}`}>
      <Motif className={`absolute top-7 right-7 h-10 w-10 ${dark ? "text-white/15" : "text-[#2d8a7c]/15"}`} strokeWidth={1.2} />
      <div className="flex items-center gap-3">
        <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${dark ? "text-[#fbbf24]" : "text-[#2d8a7c]"}`}>{eyebrow}</span>
        <span className={`font-mono text-[11px] ${dark ? "text-white/40" : "text-slate-400"}`}>· {n}/{total}</span>
      </div>
      {title && <h2 className={`mt-3 font-serif text-3xl sm:text-4xl font-bold pr-14 ${dark ? "text-white" : "text-slate-900"}`}>{title}</h2>}
      <div className="mt-7">{children}</div>
      <div className={`mt-10 pt-4 border-t text-[10px] font-mono uppercase tracking-widest flex justify-between ${dark ? "border-white/10 text-white/40" : "border-slate-100 text-slate-400"}`}>
        <span>EquiMind · Biglyp</span><span>Private to you</span>
      </div>
    </section>
  );
};

export const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}>{children}</span>
);
