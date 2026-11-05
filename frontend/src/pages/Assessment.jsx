import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Leaf } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/Shell";
import { api, errMsg, AREA_COLORS } from "@/lib/api";

const Intro = ({ kind, onBegin }) => (
  <div data-testid="checkin-intro" className="max-w-2xl mx-auto text-center eq-rise">
    <span className="mx-auto h-16 w-16 rounded-full bg-eq-soft grid place-items-center eq-breathe"><Leaf className="h-7 w-7 text-eq" /></span>
    <h1 className="mt-8 font-serif text-4xl sm:text-5xl font-bold text-slate-900">Think about the <em className="text-eq">last two weeks.</em></h1>
    <p className="mt-5 text-slate-600 leading-relaxed">24 short statements, one at a time. For each, choose how often it has been true for you. There are no right answers — and nothing here is shared without your consent.</p>
    {kind === "day30" && <p data-testid="day30-notice" className="mt-4 text-sm rounded-xl bg-[#fef3c7] text-[#92400e] px-4 py-2 inline-block">Day-30 retake: you&apos;ll see the same 24 items as last time, for a fair comparison.</p>}
    {kind === "retake_excluding_previous" && <p className="mt-4 text-sm rounded-xl bg-[#f3e8ff] text-[#6d28d9] px-4 py-2 inline-block">Retaking within 7 days: you&apos;ll see fresh items.</p>}
    <div><button data-testid="begin-checkin-btn" onClick={onBegin} className="mt-10 h-14 px-8 rounded-2xl bg-eq text-white font-medium inline-flex items-center gap-2 hover:bg-eq-dark transition-colors">Begin <ArrowRight className="h-4 w-4" /></button></div>
  </div>
);

const Question = ({ item, idx, total, scale, value, onPick }) => (
  <div key={item.id} data-testid="question-card" className="eq-rise max-w-2xl mx-auto rounded-[2rem] bg-white border border-eq/10 shadow-[0_30px_80px_-40px_rgb(var(--eq-p)/0.4)] p-7 sm:p-10">
    <span className="font-mono text-[11px] uppercase tracking-widest rounded-full px-3 py-1" style={{ color: AREA_COLORS[item.area], background: `${AREA_COLORS[item.area]}14` }}>{item.area_name}</span>
    <p className="mt-3 font-mono text-xs text-slate-400">Over the last two weeks…</p>
    <h2 data-testid="question-text" className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">{item.text}</h2>
    <div className="mt-8 grid gap-2.5">
      {scale.map((s) => (
        <button key={s.value} data-testid={`option-scale-${s.value}`} onClick={() => onPick(s.value)}
          className={`h-14 rounded-2xl border px-5 flex items-center justify-between text-left transition-colors duration-150 ${value === s.value ? "bg-eq border-eq text-white" : "bg-eq-bg border-transparent text-slate-700 hover:border-eq/40 hover:text-slate-900"}`}>
          <span className="font-medium">{s.label}</span>
          <span className={`font-mono text-xs ${value === s.value ? "text-white/70" : "text-slate-400"}`}>{s.value + 1}</span>
        </button>
      ))}
    </div>
    <p className="mt-5 text-xs text-slate-400 text-center">Tip: press keys 1–5 to answer · question {idx + 1} of {total}</p>
  </div>
);

const Writing = () => (
  <div data-testid="report-generating" className="max-w-xl mx-auto text-center py-16">
    <span className="mx-auto h-20 w-20 rounded-full bg-eq-soft grid place-items-center eq-breathe"><Loader2 className="h-8 w-8 text-eq animate-spin" /></span>
    <h2 className="mt-8 font-serif text-3xl font-semibold">Writing your report…</h2>
    <p className="mt-3 text-slate-500">Breathe in for 4, hold for 7, out for 8. This takes about 20 seconds.</p>
  </div>
);

export default function Assessment() {
  const [a, setA] = useState(null);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api.post("/assessments/start").then((r) => {
      setA(r.data);
      const saved = JSON.parse(localStorage.getItem(`eq-ans-${r.data.id}`) || "{}");
      setAnswers(saved);
      const firstOpen = r.data.items.findIndex((it) => saved[it.id] === undefined);
      setIdx(firstOpen === -1 ? r.data.items.length - 1 : firstOpen);
    }).catch((e) => toast.error(errMsg(e)));
  }, []);

  const pick = useCallback((v) => {
    if (!a) return;
    const item = a.items[idx];
    const next = { ...answers, [item.id]: v };
    setAnswers(next);
    localStorage.setItem(`eq-ans-${a.id}`, JSON.stringify(next));
    if (idx < a.items.length - 1) setTimeout(() => setIdx((i) => Math.min(i + 1, a.items.length - 1)), 260);
  }, [a, idx, answers]);

  useEffect(() => {
    const onKey = (e) => {
      if (!started || submitting) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 5) pick(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [pick, started, submitting]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await api.post(`/assessments/${a.id}/submit`, { responses: answers });
      localStorage.removeItem(`eq-ans-${a.id}`);
      nav(`/report/${r.data.id}`, { replace: true });
    } catch (e) {
      toast.error(errMsg(e));
      setSubmitting(false);
    }
  };

  const total = a?.items.length || 24;
  const answered = Object.keys(answers).length;
  const allDone = a && a.items.every((it) => answers[it.id] !== undefined);

  return (
    <div data-testid="assessment-page" className="min-h-screen">
      <AppHeader />
      {started && !submitting && (
        <div className="sticky top-16 z-20 bg-eq-bg/90 backdrop-blur">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex justify-between text-xs font-mono text-slate-500"><span data-testid="progress-label">Question {idx + 1} of {total}</span><span>{answered}/{total} answered</span></div>
            <div className="mt-2 h-1.5 rounded-full bg-eq/10 overflow-hidden"><div className="h-full bg-eq transition-[width] duration-500" style={{ width: `${(answered / total) * 100}%` }} /></div>
          </div>
        </div>
      )}
      <main className="px-4 sm:px-8 py-10 sm:py-14">
        {!a ? <div className="max-w-2xl mx-auto h-80 rounded-[2rem] bg-white/60 animate-pulse" /> : submitting ? <Writing /> : !started ? <Intro kind={a.kind} onBegin={() => setStarted(true)} /> : (
          <>
            <Question item={a.items[idx]} idx={idx} total={total} scale={a.scale} value={answers[a.items[idx].id]} onPick={pick} />
            <div className="max-w-2xl mx-auto mt-6 flex justify-between">
              <button data-testid="prev-question-btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="h-11 px-5 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 inline-flex items-center gap-2 transition-colors"><ArrowLeft className="h-4 w-4" /> Previous</button>
              {allDone ? (
                <button data-testid="submit-checkin-btn" onClick={submit} className="h-11 px-6 rounded-xl bg-[#f07167] text-white font-medium hover:bg-[#e85a50] inline-flex items-center gap-2 transition-colors">See my report <ArrowRight className="h-4 w-4" /></button>
              ) : (
                <button data-testid="next-question-btn" disabled={answers[a.items[idx].id] === undefined || idx === total - 1} onClick={() => setIdx(idx + 1)} className="h-11 px-5 rounded-xl bg-white border border-eq/15 text-slate-700 hover:text-slate-900 disabled:opacity-30 inline-flex items-center gap-2 transition-colors">Next <ArrowRight className="h-4 w-4" /></button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
