import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Moon, HeartPulse, Users, Fingerprint, Wallet, ClipboardList, FileText, CalendarCheck, Lock, ArrowRight } from "lucide-react";
import { Logo, SafetyStrip } from "@/components/Shell";
import { AREA_COLORS } from "@/lib/api";

const AREAS = [
  { k: "A", icon: BookOpen, name: "Academic & Workload", d: "Deadlines, avoidance, focus and performance pressure." },
  { k: "B", icon: Moon, name: "Body & Sleep", d: "Sleep timing, rest quality, daytime energy and self-care." },
  { k: "C", icon: HeartPulse, name: "Emotional Load & Coping", d: "Overwhelm, restlessness, low motivation and escape habits." },
  { k: "D", icon: Users, name: "Social & Belonging", d: "Honest connection, hiding distress, breakups and fitting in." },
  { k: "E", icon: Fingerprint, name: "Identity & Self-worth", d: "Comparison, self-criticism, rest-guilt and self-doubt." },
  { k: "F", icon: Wallet, name: "Family, Money & Future", d: "Money worry, family expectations and career uncertainty." },
];

const STEPS = [
  { icon: ClipboardList, t: "24 quick questions", d: "About 6 minutes. Think only about the last two weeks — one question at a time." },
  { icon: FileText, t: "Your 11-page report", d: "Scores across six areas, what you may be going through, and why it matters." },
  { icon: CalendarCheck, t: "A 14-day starter plan", d: "Five tiny activities, a mood strip and a weekly tracker. Retake on Day 30." },
];

const HeroCard = () => (
  <div className="relative eq-rise eq-d2">
    <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-[#fef3c7] eq-breathe" />
    <div className="relative rounded-[2rem] bg-white p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(45,138,124,0.35)] border border-[#2d8a7c]/10 space-y-5">
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-[#e6f4f1]" />
        <p className="rounded-2xl rounded-tl-sm bg-[#f3f4fb] px-4 py-3 text-[15px] text-slate-700">I&apos;ve been sleeping late and the deadlines keep piling up.</p>
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <div className="h-9 w-9 shrink-0 rounded-full bg-[#2d8a7c] grid place-items-center"><Sparkles className="h-4 w-4 text-white" /></div>
        <div className="rounded-2xl rounded-tr-sm bg-[#e6f4f1] px-4 py-3 text-[15px] text-slate-700">
          Your responses suggest sleep is the easiest link to change first. Try <b>phone across the room</b> tonight — it takes 30 seconds.
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2">
        {[["Body & Sleep", 28, "#f07167"], ["Academic", 36, "#f59e0b"], ["Family", 55, "#2d8a7c"]].map(([n, s, c]) => (
          <div key={n} className="rounded-xl bg-[#f0fbf9] p-3">
            <div className="font-mono text-lg font-semibold" style={{ color: c }}>{s}</div>
            <div className="text-[11px] text-slate-500">{n}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 eq-grain opacity-60" />
    <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
      <div>
        <span className="eq-rise inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#2d8a7c] shadow-sm border border-[#2d8a7c]/10">
          <Sparkles className="h-4 w-4" /> Stress check-in for UG &amp; PG students
        </span>
        <h1 className="eq-rise eq-d1 mt-7 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-slate-900">
          Understand it.<br />Act on it. Feel <em className="text-[#2d8a7c]">balanced.</em>
        </h1>
        <p className="eq-rise eq-d2 mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
          EquiMind is a private, two-week stress check-in for university students. 24 questions across six areas of student life turn into a calm, honest report and a 14-day plan of tiny, doable steps.
        </p>
        <div className="eq-rise eq-d3 mt-9 flex flex-wrap gap-3">
          <Link to="/login" data-testid="hero-start-checkin-btn" className="h-14 px-7 rounded-2xl bg-[#2d8a7c] text-white font-medium inline-flex items-center gap-2 hover:bg-[#226b60] transition-colors shadow-lg shadow-[#2d8a7c]/20">
            Start your check-in <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how" data-testid="hero-how-it-works-btn" className="h-14 px-7 rounded-2xl bg-white text-slate-800 font-medium inline-flex items-center border border-[#2d8a7c]/15 hover:border-[#2d8a7c]/40 transition-colors">
            Learn how it works
          </a>
        </div>
        <div className="eq-rise eq-d4 mt-12 flex gap-10">
          {[["24", "Questions"], ["6", "Life areas"], ["14-day", "Starter plan"]].map(([a, b]) => (
            <div key={b}><div className="font-serif text-2xl font-bold text-slate-900">{a}</div><div className="text-sm text-slate-500">{b}</div></div>
          ))}
        </div>
      </div>
      <HeroCard />
    </div>
  </section>
);

const AreasSection = () => (
  <section id="areas" className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#2d8a7c]">Six areas of student life</p>
    <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-slate-900 max-w-2xl">Stress rarely lives in one place. We look at all six.</h2>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {AREAS.map(({ k, icon: Icon, name, d }) => (
        <div key={k} data-testid={`area-card-${k}`} className="group rounded-2xl bg-white p-7 border border-[#2d8a7c]/10 hover:-translate-y-1 hover:shadow-lg transition-[transform,box-shadow] duration-300">
          <span className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `${AREA_COLORS[k]}18` }}><Icon className="h-5 w-5" style={{ color: AREA_COLORS[k] }} /></span>
          <h3 className="mt-5 text-lg font-semibold text-slate-800">{name}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{d}</p>
        </div>
      ))}
    </div>
  </section>
);

const HowSection = () => (
  <section id="how" className="bg-white/60 border-y border-[#2d8a7c]/10">
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-2 gap-14 items-center">
      <img src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200" alt="Student writing in a journal" className="rounded-[2rem] w-full h-[420px] object-cover" />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#2d8a7c]">How it works</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-slate-900">A map to act on — <em className="text-[#2d8a7c]">not a verdict.</em></h2>
        <div className="mt-10 space-y-7">
          {STEPS.map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="flex gap-5">
              <span className="h-12 w-12 shrink-0 rounded-2xl bg-[#e6f4f1] grid place-items-center"><Icon className="h-5 w-5 text-[#2d8a7c]" /></span>
              <div><div className="font-mono text-xs text-slate-400">0{i + 1}</div><h3 className="text-lg font-semibold text-slate-800">{t}</h3><p className="text-sm text-slate-500 mt-1">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const PrivacySection = () => (
  <section id="privacy" className="max-w-6xl mx-auto px-4 sm:px-8 py-20 grid md:grid-cols-[1fr_1.2fr] gap-10 items-start">
    <div>
      <span className="h-12 w-12 rounded-2xl bg-[#1b1e3d] grid place-items-center"><Lock className="h-5 w-5 text-[#fbbf24]" /></span>
      <h2 className="mt-5 font-serif text-3xl font-bold text-slate-900">Private to you. Always.</h2>
    </div>
    <div className="space-y-5 text-slate-600 leading-relaxed">
      <p>Your responses and report are never shared with faculty, parents, recruiters or peers without your explicit consent. EquiMind is a self-reflection and action tool — not a diagnosis, and not an evaluation of your ability.</p>
      <SafetyStrip testid="landing-safety-strip" />
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-[#2d8a7c]/10">
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 grid sm:grid-cols-[2fr_1fr_1fr] gap-10">
      <div><Logo /><p className="mt-4 text-sm text-slate-500 max-w-sm">Supporting student wellbeing with honest self-reflection and small, doable actions.</p></div>
      <div className="space-y-2 text-sm"><div className="font-serif font-semibold text-slate-800 mb-3">Explore</div><a href="#areas" className="block text-slate-500 hover:text-slate-900">Six areas</a><a href="#how" className="block text-slate-500 hover:text-slate-900">How it works</a><a href="#privacy" className="block text-slate-500 hover:text-slate-900">Privacy</a></div>
      <div className="space-y-2 text-sm"><div className="font-serif font-semibold text-slate-800 mb-3">Get help today</div><a href="tel:14416" className="block text-slate-500 hover:text-slate-900">Tele-MANAS 14416</a><a href="tel:112" className="block text-slate-500 hover:text-slate-900">Emergency 112</a></div>
    </div>
  </footer>
);

export default function Landing() {
  return (
    <div data-testid="landing-page">
      <header className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex gap-8 text-sm text-slate-600">
          <a href="#areas" data-testid="nav-areas-link" className="hover:text-slate-900">Six areas</a>
          <a href="#how" data-testid="nav-how-link" className="hover:text-slate-900">How it works</a>
          <a href="#privacy" data-testid="nav-privacy-link" className="hover:text-slate-900">Privacy</a>
        </nav>
        <Link to="/login" data-testid="nav-sign-in-btn" className="h-10 px-5 rounded-full bg-slate-900 text-white text-sm inline-flex items-center hover:bg-slate-700 transition-colors">Sign in</Link>
      </header>
      <Hero />
      <AreasSection />
      <HowSection />
      <PrivacySection />
      <Footer />
    </div>
  );
}
