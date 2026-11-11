import { Mountain, Waves, Moon, Sun, Leaf, Cloud, Sprout, Feather, Wind, Flower2, Star } from "lucide-react";

const MOTIFS = [Sun, Mountain, Waves, Leaf, Sprout, Feather, Moon, Cloud, Wind, Flower2, Star];

export const PageShell = ({ n, total, title, eyebrow, id, children, dark, testid, art, artAlt = "" }) => {
  const Motif = MOTIFS[(n - 1) % MOTIFS.length];
  return (
    <section id={id} data-pdf-page data-testid={testid}
      className={`relative overflow-hidden rounded-[2rem] p-7 sm:p-10 border scroll-mt-24 ${dark ? "ft-bg border-transparent" : "bg-white border-eq/10"}`}>
      {!art && <Motif className={`absolute top-7 right-7 h-10 w-10 ${dark ? "ft-faint opacity-40" : "text-eq/15"}`} strokeWidth={1.2} />}
      <div className={art ? "flex items-center justify-between gap-5" : ""}>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${dark ? "ft-accent" : "text-eq"}`}>{eyebrow}</span>
            <span className={`font-mono text-[11px] ${dark ? "ft-faint" : "text-slate-400"}`}>· {n}/{total}</span>
          </div>
          {title && <h2 className={`mt-3 font-serif text-3xl sm:text-4xl font-bold ${art ? "" : "pr-14"} ${dark ? "ft-fg" : "text-slate-900"}`}>{title}</h2>}
        </div>
        {art && <img src={art} alt={artAlt} data-testid={`${testid}-art`} draggable={false} className="h-24 w-24 sm:h-36 sm:w-36 shrink-0 rounded-3xl object-cover ring-1 ring-eq/10 shadow-[0_12px_30px_-18px_rgb(var(--eq-p)/0.6)]" />}
      </div>
      <div className="mt-7">{children}</div>
      <div className={`mt-10 pt-4 border-t text-[10px] font-mono uppercase tracking-widest flex justify-between ${dark ? "ft-line ft-faint" : "border-slate-100 text-slate-400"}`}>
        <span>EquiMind · Biglyp</span><span>Private to you</span>
      </div>
    </section>
  );
};

export const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}>{children}</span>
);
