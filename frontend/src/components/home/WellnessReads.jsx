import { useState } from "react";
import { ArrowRight, BookOpen, Clock, Lightbulb, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Reader = ({ a, onClose }) => (
  <Dialog open={!!a} onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent data-testid="article-dialog" className="w-[calc(100%-2rem)] max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
      {a && (<>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-eq-soft text-eq-dark font-semibold px-3 py-1">{a.area_name}</span>
          <span className="text-slate-500 inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.minutes} min read</span>
        </div>
        <DialogTitle data-testid="article-title" className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{a.title}</DialogTitle>
        <DialogDescription className="mt-2 text-slate-500">{a.summary}</DialogDescription>
        <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">{a.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        <div data-testid="article-try" className="mt-6 rounded-2xl bg-eq-bg border border-eq/15 p-4 flex gap-3">
          <Lightbulb className="h-5 w-5 text-eq shrink-0 mt-0.5" />
          <div><p className="text-xs font-semibold uppercase tracking-wider text-eq">Try this today</p><p className="mt-1 text-slate-800">{a.try}</p></div>
        </div>
        <p className="mt-5 text-center font-serif text-lg text-eq-dark">You&apos;ve got this.</p>
      </>)}
    </DialogContent>
  </Dialog>
);

const Row = ({ a, onOpen }) => (
  <button data-testid={`read-row-${a.id}`} onClick={() => onOpen(a)} className="group w-full py-4 flex items-start gap-4 text-left">
    <span className="h-12 w-12 shrink-0 rounded-2xl bg-eq-soft grid place-items-center"><BookOpen className="h-5 w-5 text-eq-dark" /></span>
    <span className="flex-1 min-w-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-eq">{a.area_name}</span>
      <span className="block font-semibold text-slate-800 group-hover:text-eq-dark transition-colors">{a.title}</span>
      <span className="block text-sm text-slate-500 line-clamp-2">{a.summary}</span>
    </span>
    <span className="shrink-0 text-xs text-slate-400 inline-flex items-center gap-1 mt-1"><Clock className="h-3.5 w-3.5" />{a.minutes} min</span>
  </button>
);

export const Nudge = ({ n, mood }) => (
  <div data-testid="daily-nudge" className="rounded-3xl bg-gradient-to-br from-eq-soft to-eq-bg p-5 border border-eq/10">
    <p className="text-xs font-semibold uppercase tracking-wider text-eq inline-flex items-center gap-1.5"><Sun className="h-4 w-4" /> Today&apos;s mental nudge{mood ? ` · feeling ${mood.toLowerCase()}` : ""}</p>
    <p data-testid="daily-nudge-title" className="mt-2 font-serif text-xl font-bold text-slate-900">{n.title}</p>
    <p className="mt-1.5 text-sm text-slate-700">{n.text}</p>
    <p className="mt-3 text-sm font-medium text-eq-dark">{n.area_tip}</p>
  </div>
);

export const WellnessReads = ({ plan, onAll }) => {
  const [a, setA] = useState(null);
  if (!plan) return <div className="h-72 rounded-[2rem] bg-white/60 animate-pulse" />;
  return (
    <section data-testid="wellness-reads-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-3"><span className="h-10 w-10 rounded-full bg-eq-soft grid place-items-center"><BookOpen className="h-5 w-5 text-eq-dark" /></span>Wellness Reads</h2>
        {onAll && <button data-testid="wellness-reads-view-all" onClick={onAll} className="text-sm text-eq hover:text-eq-dark inline-flex items-center gap-1">View All <ArrowRight className="h-4 w-4" /></button>}
      </div>
      <div className="mt-5"><Nudge n={plan.nudge} mood={plan.mood_label} /></div>
      <div className="mt-2 divide-y divide-slate-100">{plan.reads.map((x) => <Row key={x.id} a={x} onOpen={setA} />)}</div>
      <Reader a={a} onClose={() => setA(null)} />
    </section>
  );
};

export const AllReads = ({ reads }) => {
  const [a, setA] = useState(null);
  if (!reads) return <div className="h-72 rounded-[2rem] bg-white/60 animate-pulse" />;
  const mine = reads.filter((r) => r.for_you);
  const more = reads.filter((r) => !r.for_you);
  return (
    <section data-testid="all-reads-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
      <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-3"><span className="h-10 w-10 rounded-full bg-eq-soft grid place-items-center"><BookOpen className="h-5 w-5 text-eq-dark" /></span>Wellness Reads</h2>
      {[["Picked for you", mine], ["More to explore", more]].map(([t, list]) => list.length > 0 && (
        <div key={t} className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t}</p>
          <div className="mt-1 grid lg:grid-cols-2 gap-x-8 divide-y lg:divide-y-0 divide-slate-100">{list.map((x) => <Row key={x.id} a={x} onOpen={setA} />)}</div>
        </div>
      ))}
      <Reader a={a} onClose={() => setA(null)} />
    </section>
  );
};
