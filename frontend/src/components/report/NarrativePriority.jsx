import { ArrowRight, RefreshCw, Clock, Sparkles } from "lucide-react";
import { PageShell, Pill, Art } from "@/components/report/PageShell";
import { LEVEL_STYLE } from "@/lib/api";

export const NarrativePage = ({ r, n, total }) => (
  <PageShell n={n} total={total} eyebrow="Page 3" title="What You May Be Going Through" id="narrative" testid="report-page-narrative" inline>
    <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-6 md:gap-8 items-center [&>*]:min-w-0">
      <Art src="/report-art/narrative.webp" alt="A student reflecting" testid="report-page-narrative-art" className="max-w-[340px] mx-auto" />
      <div>
        <p data-testid="narrative-text" className="font-serif text-lg sm:text-xl leading-relaxed text-slate-800">{r.narrative.narrative}</p>
        {r.narrative.source === "ai" && <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Written with AI from your own answers, within EquiMind&apos;s safe-wording rules.</p>}
      </div>
    </div>
    {r.high_items.length > 0 && (
      <div className="mt-8 rounded-2xl bg-eq-bg p-6">
        <h3 className="font-semibold text-slate-800">You said these are happening often or almost always</h3>
        <ul className="mt-4 space-y-2" data-testid="high-items-list">
          {r.high_items.map((t) => <li key={t} className="flex gap-3 text-slate-700"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#f07167] shrink-0" />{t}</li>)}
        </ul>
      </div>
    )}
    <div className="mt-8">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-slate-500 flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5" /> The loop under it all</h3>
      <div data-testid="stress-loop" className="mt-4 flex flex-wrap items-center gap-2">
        {r.narrative.loop.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="rounded-full bg-eq-soft text-slate-800 px-4 py-2 text-sm">{s}</span>
            {i < r.narrative.loop.length - 1 && <ArrowRight className="h-4 w-4 text-[#f07167]" />}
          </span>
        ))}
      </div>
      <p className="mt-4 text-slate-600 italic">{r.narrative.loop_note}</p>
    </div>
  </PageShell>
);

const ActivityCard = ({ a, i, testid }) => (
  <div data-testid={testid} className="rounded-2xl bg-[#fff0ee] border border-[#f07167]/20 p-6">
    <div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] uppercase tracking-widest text-[#c2410c]">Activity {i + 1}</span><span className="text-xs text-[#c2410c] flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.time}</span></div>
    <h4 className="mt-2 font-serif text-xl font-semibold text-slate-900">{a.name}</h4>
    <ol className="mt-4 space-y-2.5">
      {a.steps.map((s, j) => <li key={s} className="flex gap-3 text-sm text-slate-700"><span className="h-6 w-6 shrink-0 rounded-full bg-white text-[#c2410c] font-mono text-xs grid place-items-center">{j + 1}</span>{s}</li>)}
    </ol>
    <p className="mt-4 text-xs text-slate-500"><b className="text-slate-700">When it helps:</b> {a.when}</p>
  </div>
);

const Score = ({ p }) => (
  <div className="flex flex-wrap items-center gap-3">
    <span className="font-mono text-3xl font-semibold text-slate-900">{p.score}<span className="text-base text-slate-400">/100</span></span>
    <Pill className={LEVEL_STYLE[p.level]}>{p.level}</Pill>
  </div>
);

const Why = ({ p }) => (
  <div className="rounded-2xl bg-eq-soft p-6">
    <h3 className="font-mono text-[11px] uppercase tracking-widest text-eq-dark">Why this matters</h3>
    <p className="mt-3 text-slate-800 leading-relaxed">{p.theory}</p>
  </div>
);

// MindMellow areas reuse the closest EquiMind illustration
const MM_ART = { A: "a", B: "f", C: "f", D: "d", E: "c", F: "b" };

export const PriorityPage = ({ p, idx, n, total, programme }) => {
  const art = <Art src={`/report-art/area_${programme === "mindmellow" ? MM_ART[p.area] : p.area.toLowerCase()}.webp`} alt={p.name} testid={`report-page-priority-${idx + 1}-art`} className="max-w-[420px] mx-auto" />;
  return (
    <PageShell n={n} total={total} eyebrow={`Priority ${idx + 1}`} title={p.name} id={`priority-${idx + 1}`} testid={`report-page-priority-${idx + 1}`} inline
      side={idx === 0 ? art : null} headExtra={idx === 0 ? <Score p={p} /> : null}>
      {idx === 0 ? (
        <Why p={p} />
      ) : (
        <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-6 items-center [&>*]:min-w-0">
          {art}
          <div className="space-y-4"><Score p={p} /><Why p={p} /></div>
        </div>
      )}
      <h3 className="mt-8 font-mono text-[11px] uppercase tracking-widest text-[#c2410c]">Do this</h3>
      <div className="mt-3 grid md:grid-cols-2 gap-4">
        {p.activities.map((a, i) => <ActivityCard key={a.id} a={a} i={i} testid={`priority-${idx + 1}-activity-${i + 1}`} />)}
      </div>
    </PageShell>
  );
};
