import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowDown, ShieldCheck, Sparkles, CalendarCheck, Heart, Flower2, Sailboat, Sunrise } from "lucide-react";
import { useTheme, ALL_PALETTES } from "@/lib/theme";
import { BRANDS } from "@/lib/brand";
import { ThemeToggle } from "@/components/Shell";
import { Hero, AreasSection, HowSection, PrivacySection, Footer } from "@/pages/Landing";

/** Order requested for the product switcher: youngest learners first. */
const ORDER = ["focusedge", "mindedge", "mindmellow", "equimind"];
const ICONS = { equimind: Heart, mindmellow: Flower2, mindedge: Sailboat, focusedge: Sunrise };
const GRADES = { focusedge: "Class 6–8", mindedge: "Class 9–10", mindmellow: "Class 11–12", equimind: "University" };
const BLURB = {
  focusedge: "Focus, attention and study habits — a calm 40-question check-in with a 14-day starter plan.",
  mindedge: "Stress in the board-exam build-up years — school, sleep, friends, family and screens.",
  mindmellow: "Board exams, entrance tests and big decisions — gentle support for the final school years.",
  equimind: "Academic, money, sleep and relationship stress for college and university students.",
};

const BiglypMark = () => (
  <Link to="/" data-testid="biglyp-logo-link" className="flex items-center gap-2.5">
    <span className="h-11 w-11 rounded-2xl grid place-items-center shadow-sm bg-gradient-to-br from-[#5a5fc8] via-[#2f6fa3] to-[#2d8a7c]">
      <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
    </span>
    <span className="leading-none">
      <span className="font-serif text-2xl font-semibold text-slate-900">Biglyp</span>
      <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1">Student wellbeing</span>
    </span>
  </Link>
);

const CommonHero = () => (
  <section data-testid="biglyp-hero" className="relative overflow-hidden">
    <div aria-hidden className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#dedff8] blur-3xl opacity-70" />
    <div aria-hidden className="absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-[#d6eee4] blur-3xl opacity-70" />
    <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-16 lg:pt-16 lg:pb-20 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600"><ShieldCheck className="h-3.5 w-3.5 text-[#2d8a7c]" /> Private · Non-diagnostic · Made in India</span>
        <h1 data-testid="biglyp-hero-title" className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05]">Small, honest steps to a <em className="text-[#5a5fc8]">calmer, more focused</em> you.</h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">Biglyp brings four private check-ins together — one for every stage from Class 6 to university. A few minutes of honest answers become a friendly report and a 14-day plan of tiny, doable steps.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#programmes" data-testid="biglyp-hero-cta" className="h-12 px-6 rounded-full bg-slate-900 text-white font-medium inline-flex items-center gap-2 hover:bg-slate-700 transition-colors">Choose your programme <ArrowDown className="h-4 w-4" /></a>
          <a href="#how" className="h-12 px-6 rounded-full bg-white border border-slate-200 text-slate-800 font-medium inline-flex items-center gap-2 hover:border-slate-400 transition-colors">How it works</a>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
          {[["4", "Programmes"], ["6 → Uni", "Class 6 to university"], ["14-day", "Starter plans"]].map(([a, b]) => (
            <div key={b}><div className="font-serif text-2xl font-bold text-slate-900 whitespace-nowrap">{a}</div><div className="text-xs text-slate-500 mt-1">{b}</div></div>
          ))}
        </div>
      </div>
      <div className="relative">
        <img src="/how/biglyp_hero.webp" alt="Students of different ages relaxing together with books, a tablet and a laptop" data-testid="biglyp-hero-art" draggable={false} className="w-full h-auto select-none mix-blend-multiply" />
        <div className="absolute bottom-4 left-2 sm:left-6 rounded-2xl bg-white/90 backdrop-blur shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3">
          <CalendarCheck className="h-5 w-5 text-[#2d8a7c]" />
          <div className="text-xs"><div className="font-semibold text-slate-800">One check-in, one plan</div><div className="text-slate-500">Tiny steps, tracked daily</div></div>
        </div>
      </div>
    </div>
  </section>
);

const ProductSwitcher = ({ sel, pick }) => (
  <section id="programmes" data-testid="biglyp-product-switcher" className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-10 scroll-mt-4">
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">Choose your programme</p>
    <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-slate-900">Which one fits you?</h2>
    <div role="tablist" aria-label="Biglyp programmes" className="mt-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {ORDER.map((k) => {
        const b = BRANDS[k];
        const Icon = ICONS[k];
        const c = ALL_PALETTES[b.palettes[0]].p;
        const on = sel === k;
        return (
          <button key={k} role="tab" aria-selected={on} data-testid={`hub-product-${k}`} onClick={() => pick(k)}
            className={`relative text-left rounded-3xl p-5 border-2 transition-all duration-300 ${on ? "bg-white shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)] -translate-y-0.5" : "bg-white/60 border-transparent hover:bg-white hover:border-slate-200"}`}
            style={on ? { borderColor: c } : {}}>
            <div className="flex items-center justify-between">
              <span className="h-11 w-11 rounded-2xl grid place-items-center" style={{ background: c }}><Icon className="h-5 w-5 text-white" strokeWidth={2.2} /></span>
              <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: `${c}1a`, color: c }}>{GRADES[k]}</span>
            </div>
            <div className="mt-4 font-serif text-xl font-bold text-slate-900">{b.name}</div>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{BLURB[k]}</p>
            <div className="mt-4 text-sm font-medium inline-flex items-center gap-1.5" style={{ color: c }}>{on ? "Showing below" : "Explore"} <ArrowRight className="h-4 w-4" /></div>
          </button>
        );
      })}
    </div>
  </section>
);

export default function BiglypHome() {
  const { setBrand, B } = useTheme();
  const [params, setParams] = useSearchParams();
  const q = params.get("p");
  const sel = BRANDS[q] ? q : B.key;
  useEffect(() => { setBrand(sel); }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.title = "Biglyp — Student wellbeing check-ins"; }, [B.key]);
  const pick = (k) => setParams({ p: k }, { replace: true });
  return (
    <div data-testid="biglyp-home" className="bg-gradient-to-b from-white via-[#f7f8fc] to-white">
      <header className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <BiglypMark />
        <nav className="hidden md:flex gap-8 text-sm text-slate-600">
          <a href="#programmes" className="hover:text-slate-900">Programmes</a>
          <a href="#how" className="hover:text-slate-900">How it works</a>
          <a href="#privacy" className="hover:text-slate-900">Privacy</a>
        </nav>
        <Link to={B.login} data-testid="biglyp-sign-in-btn" className="h-10 px-5 rounded-full bg-slate-900 text-white text-sm whitespace-nowrap inline-flex items-center hover:bg-slate-700 transition-colors">Sign in to {B.name}</Link>
      </header>
      <CommonHero />
      <ProductSwitcher sel={sel} pick={pick} />
      {B.key === sel && (
        <div data-testid={`hub-product-panel-${sel}`} key={sel} className="eq-rise border-t border-slate-200/70 bg-eq-bg/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-eq">{B.name} · {GRADES[sel]}</span>
            <div className="flex items-center gap-3"><ThemeToggle /><Link to={B.home} data-testid="hub-open-product-page" className="text-sm font-medium text-eq-dark hover:underline">Open {B.name} page →</Link></div>
          </div>
          <Hero />
          <AreasSection />
          <HowSection />
          <PrivacySection />
        </div>
      )}
      <Footer />
    </div>
  );
}
