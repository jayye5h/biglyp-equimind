import { Copy, Phone, MessageCircleMore, Sun, Pill, Droplet, HeartPulse, UtensilsCrossed, Footprints, Stethoscope, Eye, Moon } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Art, RImg } from "@/components/report/PageShell";
import { fmtDate } from "@/lib/api";
import { brandOf } from "@/lib/brand";
const isFE = (r) => r?.programme === "focusedge";
const isME = (r) => r?.programme === "mindedge" || isFE(r);

const feTiers = (r) => [
  { t: "1. Yourself", art: "help_self", c: "bg-eq-soft text-eq-dark", d: `The 14-day plan is yours — ${r.plan.map((a) => a.short.toLowerCase()).join(", ")}. Start today, however small.` },
  { t: "2. Parent / guardian", art: "help_trusted", c: "bg-[#fef3c7] text-[#92400e]", d: "Help with setup (a quiet study spot, phone rules, bedtime), gentle reminders, and sitting nearby while you study. For anything about meals, sleep, screens or doctor visits — go to them first." },
  { t: "3. Your teacher", art: "help_campus", c: "bg-[#e9f7f1] text-[#2e7c63]", d: "Can help by writing instructions down, letting you sit near the front, repeating things, giving extra time and checking in with you. You can ask a kind teacher 'can you tell me what I missed?' without feeling bad." },
  { t: "4. School counsellor / doctor", art: "help_pro", c: r.path === 2 ? "bg-[#c2410c] text-white" : "bg-[#fff0ee] text-[#c2410c]", strong: r.path === 2,
    d: r.path === 2 ? `Through a parent. Your pattern (overall ${r.overall}, lowest ${Math.min(...r.areas.map((a) => a.score))}) makes a counsellor conversation a good idea in the next 1–2 weeks.` : "Through a parent. For sleep that won't budge, very low focus that affects school for weeks, or when the plan isn't moving after a month." },
];

const tiers = (r) => isFE(r) ? feTiers(r) : [
  { t: "1. Yourself", art: "help_self", c: "bg-eq-soft text-eq-dark", d: `Your 14-day plan: ${r.plan.map((a) => a.short.toLowerCase()).join(", ")}. Start today.` },
  isME(r)
    ? { t: "2. A trusted adult", art: "help_trusted", c: "bg-[#fef3c7] text-[#92400e]", d: "Parent, aunt / uncle, elder cousin, class teacher. For peer problems, home tension, self-worth hits, exam anxiety. Ask for 15 quiet minutes — tell them you just want to be heard, not fixed." }
    : { t: "2. One trusted person", art: "help_trusted", c: "bg-[#fef3c7] text-[#92400e]", d: `Family or a close friend. For ${brandOf(r).key === "mindmellow" ? "breakup fallout, money / future worry" : "money worry, homesickness"}, or feeling alone with it. A call home that includes one real thing — not just 'all fine'.` },
  { t: `3. ${brandOf(r).counsellorTitle}`, art: "help_campus", c: r.path === 2 ? "bg-[#c2410c] text-white" : "bg-[#fff0ee] text-[#c2410c]", strong: r.path === 2,
    d: r.path === 2 ? `Book this week${isME(r) ? " (through a parent or class teacher)" : ""}. Free, confidential. Your score pattern (overall ${r.overall}, lowest ${Math.min(...r.areas.map((a) => a.score))}) makes this strongly suggested.` : "Free and confidential. For sleep that won't budge, worry that interferes with life, or feeling you've been carrying it too long alone." },
  { t: "4. Professional help", art: "help_pro", c: "bg-[#f3e8ff] text-[#6d28d9]", d: `Psychologist, psychiatrist or doctor — usually reached through your counsellor${isME(r) ? " or parents" : ""}. Needed when low mood or loss of interest lasts most days for 2 weeks+, panic attacks, using substances to cope, or the plan makes no difference after 4 weeks.` },
];

export const HelpPage = ({ r, n, total }) => (
  <PageShell n={n} total={total} eyebrow="Support" title="Who Can Help & When to Ask" id="help" testid="report-page-help" inline side={<Art src="/report-art/help_head.webp" alt="Talking with a counsellor" testid="report-page-help-art" className="max-w-[360px] ml-auto" />}>
    <HelpContent r={r} />
  </PageShell>
);

export const HelpContent = ({ r }) => {
  const copy = (t) => navigator.clipboard?.writeText(t).then(() => toast.success("Copied"));
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {tiers(r).map((x, i) => (
          <div key={x.t} data-testid={`help-tier-${i + 1}`} className={`rounded-2xl p-5 grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] gap-4 items-center ${x.c}`}>
            <RImg src={`/report-art/${x.art}.webp`} alt="" draggable={false} className="w-full h-auto" data-testid={`help-tier-art-${i + 1}`} />
            <div className="border-l border-current/20 pl-4" style={{ borderColor: "rgba(100,116,139,0.25)" }}>
              <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{x.t}</h3>{x.strong && <span className="text-[10px] font-mono uppercase bg-white/25 rounded-full px-2 py-0.5">Strongly suggested</span>}</div>
              <p className="mt-2 text-sm opacity-90 leading-relaxed">{x.d}</p>
            </div>
          </div>
        ))}
      </div>
      <h3 className="mt-8 font-mono text-[11px] uppercase tracking-widest text-slate-500">Ready-to-copy scripts</h3>
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        {r.scripts.map((s, i) => (
          <div key={s.to} className="rounded-2xl border border-slate-100 p-4 flex flex-col">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2"><MessageCircleMore className="h-5 w-5 text-eq" />{s.to}</div>
            <p className="mt-2 text-sm text-slate-700 italic flex-1">&ldquo;{s.text}&rdquo;</p>
            <button data-testid={`copy-script-${i}`} onClick={() => copy(s.text)} className="mt-3 self-start text-xs text-eq hover:text-eq-dark flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy</button>
          </div>
        ))}
      </div>
      {r.context?.away && (
        <div data-testid="family-distance-card" className="mt-8 rounded-2xl border border-eq/20 bg-eq-bg p-5">
          <h4 className="font-semibold text-eq-dark">Staying close while you&apos;re away from home</h4>
          <p className="mt-1.5 text-sm text-slate-700">You told us you&apos;re {r.context.labels?.living?.toLowerCase() || "living away from your parents"}{r.context.low_contact ? ` and talk to family ${r.context.labels.contact.toLowerCase()}` : ""}{r.context.feels_lonely ? ", and you often feel lonely" : ""}. Distance from the people you grew up with can quietly add to everything else — that&apos;s common, and it&apos;s not a weakness.</p>
          <ul className="mt-3 grid sm:grid-cols-3 gap-2 text-sm text-slate-700">
            <li className="rounded-xl bg-white p-3"><b>Fix a call time.</b> A 10-minute call with a parent or sibling on the same days each week.</li>
            <li className="rounded-xl bg-white p-3"><b>One old friend.</b> Message one childhood friend this week — just &ldquo;thinking of you&rdquo;.</li>
            <li className="rounded-xl bg-white p-3"><b>One person here.</b> Share one meal or walk a week with someone nearby.</li>
          </ul>
          {r.context.detachment && <p className="mt-3 text-xs text-slate-600">If missing home is weighing on you most days, your campus counsellor can help — it&apos;s one of the most common things they hear.</p>}
        </div>
      )}
      <div data-testid="get-help-today" className="mt-8 rounded-2xl ft-bg p-5 flex gap-4">
        <Phone className="h-5 w-5 ft-alert shrink-0 mt-0.5" />
        {isFE(r) ? <p className="text-sm leading-relaxed"><b className="ft-alert">GET HELP TODAY IF:</b> you feel very overwhelmed, you can&apos;t sleep, or you feel like you can&apos;t cope — tell a parent or teacher today. You can also call <b>Childline 1098</b> (free, 24/7, for young people), <b>Tele-MANAS 14416</b> or <b>1800-891-4416</b> (24/7, confidential), or <b>112</b> in an emergency.</p> :
        isME(r) ? <p className="text-sm leading-relaxed"><b className="ft-alert">GET HELP TODAY IF:</b> you have thoughts of harming yourself, or you feel really unsafe — tell a parent, teacher or adult physically near you right now. You can also call <b>Childline 1098</b> (free, 24/7 for young people), <b>Tele-MANAS 14416</b> or <b>1800-891-4416</b> (24/7, confidential), or <b>112</b> in an emergency, or go to your school counsellor.</p> :
        <p className="text-sm leading-relaxed"><b className="ft-alert">GET HELP TODAY IF:</b> you have thoughts of harming yourself or of not wanting to be alive, or you feel unsafe. Call <b>Tele-MANAS 14416</b> or <b>1800-891-4416</b> (24/7, toll-free, confidential), or <b>112</b> in an emergency, or go to {brandOf(r).school ? "your school counsellor" : "campus health"}. Tell someone physically near you.</p>}
      </div>
    </>
  );
};

const bodyIcon = (c) => { const k = c.toLowerCase(); return k.includes("eye") ? Eye : k.includes("sleep") ? Moon : k.includes("vitamin d") ? Sun : k.includes("b12") ? Pill : k.includes("iron") ? Droplet : k.includes("thyroid") ? HeartPulse : k.includes("meal") ? UtensilsCrossed : k.includes("movement") ? Footprints : Stethoscope; };

export const BodyPage = ({ r, n, total }) => (
  <PageShell n={n} total={total} eyebrow="A soft suggestion, not an alarm" title="Worth Ruling Out: Your Body" id="body" testid="report-page-body" inline side={<Art src="/report-art/body_head.webp" alt="Wondering about the body" testid="report-page-body-art" className="max-w-[320px] ml-auto" />}
    headExtra={<p className="text-slate-700 leading-relaxed -mt-2">{isFE(r) ? "Problems with focus, energy or mood at your age often have a body part that is easy to miss — not enough sleep, too many screens, a vitamin shortfall, or eyes that need checking. A short visit to a family doctor can rule these in or out." : "Low mood, tiredness, fog and poor sleep can be influenced by common physical causes that are easy to miss."} Your pattern ({r.body_pattern}) makes it worth asking: is anything else going on in your body?</p>}>
    <div className="overflow-x-auto rounded-2xl border border-eq/10">
      <table className="w-full text-sm min-w-[560px]" data-testid="body-table">
        <thead><tr className="text-left font-mono text-[11px] uppercase text-slate-500 bg-eq-bg"><th className="py-3 pl-4 font-normal">Worth ruling out</th><th className="font-normal">Can show up as</th><th className="font-normal pr-4">What to ask about</th></tr></thead>
        <tbody>{r.body_table.map((b) => { const Ic = bodyIcon(b.cause); return (
          <tr key={b.cause} className="border-t border-slate-100 align-middle">
            <td className="py-3 pl-4 pr-3"><div className="flex items-center gap-3"><span className="h-10 w-10 shrink-0 rounded-xl bg-eq-bg grid place-items-center"><Ic className="h-5 w-5 text-eq" strokeWidth={1.6} /></span><span className="font-semibold text-slate-800">{b.cause}</span></div></td>
            <td className="py-3 pr-3 text-slate-600">{b.signs}</td>
            <td className="py-3 pr-4"><span className="inline-block rounded-2xl bg-eq-bg px-3 py-1.5 text-slate-700">{b.check}</span></td>
          </tr>); })}</tbody>
      </table>
    </div>
    <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-2xl bg-eq-soft p-5"><h4 className="font-semibold text-eq-dark">What a basic health check-up looks like</h4>
        <div className="mt-3 grid grid-cols-[90px_1fr] gap-4 items-center"><RImg src="/report-art/body_check.webp" alt="" draggable={false} className="w-full h-auto" />
        {isFE(r) ? <ul data-testid="body-checkup-fe" className="border-l border-slate-300/60 pl-4 space-y-1.5 text-slate-700"><li>Ask a parent to book a 15-minute visit to a family doctor. Tell them: &lsquo;I&apos;ve been having trouble focusing and feeling tired for weeks.&rsquo;</li><li>Common checks for your age: CBC, ferritin / iron, Vitamin D, Vitamin B12, thyroid (TSH), and a simple eye check.</li><li>If focus problems have been there for a long time and clearly affect school, the doctor may suggest a paediatrician or psychologist. That&apos;s routine — not something to worry about.</li></ul> :
        <ul className="border-l border-slate-300/60 pl-4 space-y-1.5 text-slate-700"><li>A 15-minute visit to your {brandOf(r).school ? "school" : "campus"} health centre or a GP. Tell them: &lsquo;I&apos;ve been tired, sleeping poorly and finding it hard to focus for weeks.&rsquo;</li><li>A common basic panel: CBC, ferritin / iron studies, Vitamin D (25-OH), Vitamin B12, thyroid (TSH). The doctor decides which tests fit.</li></ul>}</div></div>
      <div className="rounded-2xl bg-[#fef3c7] p-5"><h4 className="font-semibold text-[#92400e]">Both can be true</h4><div className="mt-3 grid grid-cols-[90px_1fr] gap-4 items-center"><RImg src="/report-art/body_scale.webp" alt="" draggable={false} className="w-full h-auto" /><p className="border-l border-amber-300/70 pl-4 text-slate-700">{isFE(r) ? "Focus problems can come from the body AND from habits — usually both. Fix the body, keep the plan, and keep talking to your parents and teachers." : <>Stress is real AND a physical shortfall can make it harder to cope. Rule out the physical, keep going with the plan{r.path === 2 ? ", and keep your counsellor appointment" : ""}. This report never prescribes supplements or doses.</>}</p></div></div>
    </div>
  </PageShell>
);

export const AboutPage = ({ r, n, total }) => (
  <PageShell n={n} total={total} dark eyebrow="About" title="About This Report & Declaration" id="about" testid="report-page-about">
    <div className="grid md:grid-cols-2 gap-6 text-sm ft-muted leading-relaxed">
      {isFE(r) ? <>
      <div><h4 className="font-semibold ft-accent">What this report is</h4><p className="mt-2">FocusEdge is a self-reflection and wellbeing-support tool for Grades 6–8. It helps students, parents and teachers notice focus and study-habit patterns across ten everyday areas, understand what may be driving them, and act on them with small, concrete steps over 14 days. It is a wellbeing report — not a diagnosis of any condition, not an academic record, and not a ranking.</p></div>
      <div><h4 className="font-semibold ft-accent">How scores are built</h4><p className="mt-2">Based on your {r.areas.length * 4} answers to focus and self-regulation items, drawn by stratified random sampling from a 300-item bank of 10 segments × 4 sub-themes. Each segment is scored 0–100 — higher means more consistent, supportive habits in that area. Levels: below 35 needs care first; 35–49 watch; 50–64 steady; 65+ a resource. Overall is the average across the ten segments.</p></div>
      <div data-testid="privacy-counsellor-note"><h4 className="font-semibold ft-accent">Privacy</h4><p className="mt-2">This report belongs to {r.student.name}. Your school counsellors can review your report, 14-day progress and daily check-ins to support you, and may reach out or act in severe cases to keep you safe. Parents and teachers only see the parts they have been given permission to see — never the full response record by default. School safeguarding rules may apply where there are safety concerns.</p></div>
      <div><h4 className="font-semibold ft-accent">If something feels urgent</h4><p className="mt-2">This report measures focus and study habits; it does not monitor safety. If you feel very overwhelmed, unsafe, or are thinking of harming yourself, please seek help now: tell a parent or teacher, call Childline 1098 (24/7 for young people), Tele-MANAS 14416 or 1800-891-4416 (24/7, toll-free, confidential), or 112 for emergencies.</p></div>
      </> : <>
      <div><h4 className="font-semibold ft-accent">What this report is</h4><p className="mt-2">{brandOf(r).name} is a self-reflection and action tool. It helps students notice stress patterns in six areas of life, understand what may be driving them, and act on them with small, concrete steps over 14 days. It is a wellbeing report — not a diagnosis, not an evaluation of your ability, and not a prediction of your results.</p></div>
      <div><h4 className="font-semibold ft-accent">How scores are built</h4><p className="mt-2">Based on your 24 answers (4 per area), over a two-week recall. Each area is scored 0–100 — higher means less stress and more capacity. Levels: below 35 needs care first; 35–49 watch; 50–64 steady; 65+ a resource. Overall is the average of the six areas.</p></div>
      <div data-testid="privacy-counsellor-note"><h4 className="font-semibold ft-accent">Privacy & counsellor review</h4><p className="mt-2">Your report, 14-day progress, daily check-ins and feedback are available to your {brandOf(r).school ? "school" : "campus"} counsellors. They review and monitor them to support you, and may reach out or act in severe cases to keep you safe. {isME(r) ? "Nothing is shared with teachers or peers without your consent; parents are involved under your school's policy and parental consent." : "Nothing is shared with faculty, parents, recruiters or peers without your explicit consent."}</p></div>
      <div><h4 className="font-semibold ft-accent">If something feels urgent</h4><p className="mt-2">This report measures everyday stress; it does not monitor safety. If you feel unsafe or are thinking of harming yourself, please seek help now: Tele-MANAS 14416 or 1800-891-4416 (24/7, toll-free, confidential), {isME(r) ? "Childline 1098, " : ""}112 for emergencies, or {brandOf(r).school ? "your school counsellor" : "your campus health centre"}.</p></div>
      </>}
    </div>
    {r.path === 2 && <p data-testid="counsellor-handover" className="mt-6 rounded-xl ft-glass border p-4 text-sm ft-fg"><b>For your counsellor:</b> overall {r.overall}; priority areas {r.priority_pages.map((p) => `${p.name} (${p.score})`).join(", ")}. Visible to your {brandOf(r).counsellor}.</p>}
    <div data-testid="declaration" className="mt-8 rounded-2xl border ft-line p-5 text-sm ft-muted">
      <div className="font-mono text-[11px] uppercase tracking-widest ft-accent">Declaration</div>
      <p className="mt-2">This report was generated by Biglyp {r.version} on {fmtDate(r.created_at)} for {r.student.name}. Content, bands and activity library are reviewed by Biglyp&apos;s wellbeing advisory committee.</p>
    </div>
  </PageShell>
);
