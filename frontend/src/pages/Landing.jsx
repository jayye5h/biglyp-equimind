import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme, useBrand } from "@/lib/theme";
import { Sparkles, BookOpen, Moon, HeartPulse, Users, Fingerprint, Wallet, ClipboardList, FileText, CalendarCheck, Lock, ArrowRight, Focus, Rocket, Smartphone, ListTodo, Hand, Lightbulb, Mountain, Home } from "lucide-react";
import { Logo, SafetyStrip, ThemeToggle, ProductTabs } from "@/components/Shell";
import { AREA_COLORS } from "@/lib/api";

const AREAS_EQ = [
  { k: "A", icon: BookOpen, name: "Academic & Workload", d: "Deadlines, avoidance, focus and performance pressure." },
  { k: "B", icon: Moon, name: "Body & Sleep", d: "Sleep timing, rest quality, daytime energy and self-care." },
  { k: "C", icon: HeartPulse, name: "Emotional Load & Coping", d: "Overwhelm, restlessness, low motivation and escape habits." },
  { k: "D", icon: Users, name: "Social & Belonging", d: "Honest connection, hiding distress, breakups and fitting in." },
  { k: "E", icon: Fingerprint, name: "Identity & Self-worth", d: "Comparison, self-criticism, rest-guilt and self-doubt." },
  { k: "F", icon: Wallet, name: "Family, Money & Future", d: "Money worry, family expectations and career uncertainty." },
];

const AREAS_MM = [
  { k: "A", icon: BookOpen, name: "Academic & Exam Pressure", d: "Boards, JEE / NEET / CUET prep, fear of failure and focus strain." },
  { k: "B", icon: Wallet, name: "Career, Future & Financial", d: "Stream and career doubts, college admissions and money worry." },
  { k: "C", icon: Users, name: "Parental & Family Expectations", d: "Expectations, comparison, tension at home and honest talks." },
  { k: "D", icon: Fingerprint, name: "Identity, Relationships & Breakup", d: "Imposter feelings, social comparison, breakups and feeling alone." },
  { k: "E", icon: HeartPulse, name: "Emotional Overload & Coping", d: "Overwhelm, restlessness, low mood and escape habits." },
  { k: "F", icon: Moon, name: "Sleep, Lifestyle & Digital Pressure", d: "Late nights, rest quality, meals, energy and screen time." },
];
const AREAS_ME = [
  { k: "A", icon: BookOpen, name: "Academic Stress & Study Habits", d: "Homework pile-up, board-pattern tests, putting off study and marks pressure." },
  { k: "B", icon: Wallet, name: "Parental & Family Context", d: "Expectations, comparison with siblings or cousins, and tension at home." },
  { k: "C", icon: Users, name: "Peer Pressure & Social Acceptance", d: "Fitting in, saying no, feeling left out and teasing or bullying." },
  { k: "D", icon: Fingerprint, name: "Self-Esteem & Confidence", d: "The inner critic, body image and puberty, and who you're becoming." },
  { k: "E", icon: HeartPulse, name: "Emotional Regulation", d: "Overwhelm, worry, low mood and switching off feelings." },
  { k: "F", icon: Moon, name: "Digital & Social Media Stress", d: "Screen time, comparison feeds, online hurt and FOMO." },
];
const AREAS_FE = [
  { k: "D1", icon: Focus, name: "Attention & Focus", d: "Staying with a lesson, picking out what matters, holding instructions, mental tiredness." },
  { k: "D2", icon: Rocket, name: "Getting Started", d: "Starting homework, the 'where do I begin' freeze, warming up and switching tasks." },
  { k: "D3", icon: Smartphone, name: "Distraction & Delay", d: "Phone and screen pulls, wandering thoughts, 'in 5 minutes' and sudden urges." },
  { k: "D4", icon: ListTodo, name: "Planning & Organisation", d: "Breaking tasks down, keeping track of time, bag and desk, and due dates." },
  { k: "D5", icon: Hand, name: "Learning Confidence & Help-Seeking", d: "Believing you can learn, asking questions and being okay with mistakes." },
  { k: "D6", icon: Lightbulb, name: "Learning Motivation & Meaning", d: "Curiosity, boredom in class, needing praise and why school matters." },
  { k: "D7", icon: Mountain, name: "Persistence & Recovery", d: "Bouncing back from a bad mark, giving up early and learning from mistakes." },
  { k: "D8", icon: Moon, name: "Energy, Rest & Study Balance", d: "Sleep, breakfast and water, screen time and real breaks." },
  { k: "D9", icon: HeartPulse, name: "Emotional Readiness", d: "Nerves before study, frustration, mood and feeling it's all too much." },
  { k: "D10", icon: Home, name: "Study Environment & Support", d: "A quiet study spot, help at home, teachers and study buddies." },
];

const COPY = {
  equimind: {
    areas: AREAS_EQ,
    badge: "Stress check-in for UG & PG students",
    chips: [["Body & Sleep", 28, "#f07167"], ["Academic", 36, "#f59e0b"], ["Family", 55, "rgb(var(--eq-p))"]],
    desc: "EquiMind is a private, two-week stress check-in for university students. 24 questions across six areas of student life turn into a calm, honest report and a 14-day plan of tiny, doable steps.",
    privacy: "Your responses and report are never shared with faculty, parents, recruiters or peers without your explicit consent. EquiMind is a self-reflection and action tool — not a diagnosis, and not an evaluation of your ability.",
  },
  mindmellow: {
    areas: AREAS_MM,
    badge: "Wellbeing check-in for Class 11–12 students",
    chips: [["Sleep", 28, "#f07167"], ["Exams", 36, "#f59e0b"], ["Family", 55, "rgb(var(--eq-p))"]],
    desc: "MindMellow is a private, two-week stress check-in for Class 11–12 students. 24 questions across six areas — boards and entrance exams, career, family, relationships, feelings and sleep — turn into a calm, honest report and a 14-day plan of tiny, doable steps.",
    privacy: "Your responses and report are private to you. Nothing is shared with teachers, parents or peers without your consent — except as required by your school's safeguarding policy. MindMellow is a self-reflection and action tool — not a diagnosis, and not a prediction of your results.",
  },
  mindedge: {
    areas: AREAS_ME,
    badge: "Wellbeing check-in for Class 9–10 students",
    chips: [["Phone", 30, "#f07167"], ["Studies", 38, "#f59e0b"], ["Friends", 55, "rgb(var(--eq-p))"]],
    desc: "MindEdge is a private, two-week stress check-in for Class 9–10 students. 24 questions across six areas — studies, family, friends, self-esteem, feelings and screens — turn into a calm, honest report and a 14-day plan of tiny, doable steps.",
    privacy: "Your responses and report are private to you. Nothing is shared with teachers or peers without your consent, and parents are involved only under your school's policy and parental consent. MindEdge is a self-reflection and action tool — not a diagnosis, and not a prediction of your results.",
  },
  focusedge: {
    areas: AREAS_FE,
    badge: "Focus & study-habit check-in for Class 6–8",
    chips: [["Attention", 30, "#f07167"], ["Starting", 35, "#f59e0b"], ["Motivation", 50, "rgb(var(--eq-p))"]],
    desc: "FocusEdge is a private, two-week focus check-in for Class 6–8 students. 40 quick questions across ten everyday areas — attention, getting started, distractions, planning, confidence, motivation, bouncing back, energy, feelings and study space — turn into a calm, friendly report and a 14-day plan of tiny, doable steps.",
    privacy: "Your answers and report are private to you. Parents, teachers and counsellors only see what they have been given permission to see, under your school's policy and parental consent. FocusEdge is a self-reflection and wellbeing tool — not a diagnosis of any condition, not a ranking and not an academic record.",
    stats: [["40", "Questions"], ["10", "Focus areas"], ["14-day", "Starter plan"]],
    areasEyebrow: "Ten everyday focus areas", areasTitle: "Focus isn't one thing. We look at all ten.",
    quote: ["I keep picking up my phone and then the homework takes forever.", "Your answers suggest the phone is the easiest link to change first. Try", "phone in another room", "for one 25-minute burst."],
    steps: [
      { icon: ClipboardList, t: "40 quick questions", d: "About 7 minutes. Think only about the last two weeks — one question at a time." },
      { icon: FileText, t: "Your friendly report", d: "Scores across ten focus areas, what's happening, and small things to try." },
      { icon: CalendarCheck, t: "A 14-day starter plan", d: "Week 1 Notice, Week 2 Start small. Five tiny activities. Retake on Day 14." },
    ],
  },
};

const STEPS = [
  { icon: ClipboardList, t: "24 quick questions", d: "About 6 minutes. Think only about the last two weeks — one question at a time." },
  { icon: FileText, t: "Your 11-page report", d: "Scores across six areas, what you may be going through, and why it matters." },
  { icon: CalendarCheck, t: "A 14-day starter plan", d: "Five tiny activities, a mood strip and a weekly tracker. Retake on Day 30." },
];

const HeroCard = () => {
  const q = COPY[useBrand().key].quote;
  return (
  <div className="relative eq-rise eq-d2">
    <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-[#fef3c7] eq-breathe" />
    <div className="relative rounded-[2rem] bg-white p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgb(var(--eq-p)/0.35)] border border-eq/10 space-y-5">
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-eq-soft" />
        <p className="rounded-2xl rounded-tl-sm bg-[#f3f4fb] px-4 py-3 text-[15px] text-slate-700">{q ? q[0] : <>I&apos;ve been sleeping late and the deadlines keep piling up.</>}</p>
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <div className="h-9 w-9 shrink-0 rounded-full bg-eq grid place-items-center"><Sparkles className="h-4 w-4 text-white" /></div>
        <div className="rounded-2xl rounded-tr-sm bg-eq-soft px-4 py-3 text-[15px] text-slate-700">
          {q ? <>{q[1]} <b>{q[2]}</b> {q[3]}</> : <>Your responses suggest sleep is the easiest link to change first. Try <b>phone across the room</b> tonight — it takes 30 seconds.</>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2">
        {COPY[useBrand().key].chips.map(([n, s, c]) => (
          <div key={n} className="rounded-xl bg-eq-bg p-3">
            <div className="font-mono text-lg font-semibold" style={{ color: c }}>{s}</div>
            <div className="text-[11px] text-slate-500">{n}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 eq-grain opacity-60" />
    <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
      <div>
        <span className="eq-rise inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-eq shadow-sm border border-eq/10">
          <Sparkles className="h-4 w-4" /> {COPY[useBrand().key].badge}
        </span>
        <h1 className="eq-rise eq-d1 mt-7 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-slate-900">
          Understand it.<br />Act on it. Feel <em className="text-eq">balanced.</em>
        </h1>
        <p className="eq-rise eq-d2 mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
          {COPY[useBrand().key].desc}
        </p>
        <div className="eq-rise eq-d3 mt-9 flex flex-wrap gap-3">
          <Link to={useBrand().login} data-testid="hero-start-checkin-btn" className="h-14 px-7 rounded-2xl bg-eq text-white font-medium inline-flex items-center gap-2 hover:bg-eq-dark transition-colors shadow-lg shadow-eq/20">
            Start your check-in <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how" data-testid="hero-how-it-works-btn" className="h-14 px-7 rounded-2xl bg-white text-slate-800 font-medium inline-flex items-center border border-eq/15 hover:border-eq/40 transition-colors">
            Learn how it works
          </a>
        </div>
        <div className="eq-rise eq-d4 mt-12 flex gap-10">
          {(COPY[useBrand().key].stats || [["24", "Questions"], ["6", "Life areas"], ["14-day", "Starter plan"]]).map(([a, b]) => (
            <div key={b}><div className="font-serif text-2xl font-bold text-slate-900">{a}</div><div className="text-sm text-slate-500">{b}</div></div>
          ))}
        </div>
      </div>
      <HeroCard />
    </div>
  </section>
);

export const AreasSection = () => (
  <section id="areas" className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-eq">{COPY[useBrand().key].areasEyebrow || "Six areas of student life"}</p>
    <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-slate-900 max-w-2xl">{COPY[useBrand().key].areasTitle || "Stress rarely lives in one place. We look at all six."}</h2>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {COPY[useBrand().key].areas.map(({ k, icon: Icon, name, d }) => (
        <div key={k} data-testid={`area-card-${k}`} className="group rounded-2xl bg-white p-7 border border-eq/10 hover:-translate-y-1 hover:shadow-lg transition-[transform,box-shadow] duration-300">
          <span className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `${AREA_COLORS[k]}18` }}><Icon className="h-5 w-5" style={{ color: AREA_COLORS[k] }} /></span>
          <h3 className="mt-5 text-lg font-semibold text-slate-800">{name}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{d}</p>
        </div>
      ))}
    </div>
  </section>
);

export const HowSection = () => (
  <section id="how" className="bg-white/60 border-y border-eq/10">
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-2 gap-14 items-center">
      <div className="rounded-[2rem] bg-white border border-eq/10 shadow-[0_24px_60px_-36px_rgb(var(--eq-p)/0.5)] p-6 grid place-items-center">
        <img data-testid="how-it-works-art" src={`/how/${useBrand().key}.webp`} alt={`${useBrand().name} check-in illustration`} draggable={false} className="w-full max-w-[420px] h-[380px] object-contain select-none" />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-eq">How it works</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-slate-900">A map to act on — <em className="text-eq">not a verdict.</em></h2>
        <div className="mt-10 space-y-7">
          {(COPY[useBrand().key].steps || STEPS).map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="flex gap-5">
              <span className="h-12 w-12 shrink-0 rounded-2xl bg-eq-soft grid place-items-center"><Icon className="h-5 w-5 text-eq" /></span>
              <div><div className="font-mono text-xs text-slate-400">0{i + 1}</div><h3 className="text-lg font-semibold text-slate-800">{t}</h3><p className="text-sm text-slate-500 mt-1">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const PrivacySection = () => (
  <section id="privacy" className="max-w-6xl mx-auto px-4 sm:px-8 py-20 grid md:grid-cols-[1fr_1.2fr] gap-10 items-start">
    <div>
      <span className="h-12 w-12 rounded-2xl bg-[#1b1e3d] grid place-items-center"><Lock className="h-5 w-5 text-[#fbbf24]" /></span>
      <h2 className="mt-5 font-serif text-3xl font-bold text-slate-900">Private to you. Always.</h2>
    </div>
    <div className="space-y-5 text-slate-600 leading-relaxed">
      <p>{COPY[useBrand().key].privacy}</p>
      <SafetyStrip testid="landing-safety-strip" />
    </div>
  </section>
);

export const Footer = () => (
  <footer className="border-t border-eq/10">
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 grid sm:grid-cols-[2fr_1fr_1fr] gap-10">
      <div><Logo /><p className="mt-4 text-sm text-slate-500 max-w-sm">Supporting student wellbeing with honest self-reflection and small, doable actions.</p></div>
      <div className="space-y-2 text-sm"><div className="font-serif font-semibold text-slate-800 mb-3">Explore</div><a href="#areas" className="block text-slate-500 hover:text-slate-900">{useBrand().focus ? "Ten areas" : "Six areas"}</a><a href="#how" className="block text-slate-500 hover:text-slate-900">How it works</a><a href="#privacy" className="block text-slate-500 hover:text-slate-900">Privacy</a></div>
      <div className="space-y-2 text-sm"><div className="font-serif font-semibold text-slate-800 mb-3">Get help today</div><a href="tel:14416" className="block text-slate-500 hover:text-slate-900">Tele-MANAS 14416</a><a href="tel:112" className="block text-slate-500 hover:text-slate-900">Emergency 112</a></div>
    </div>
  </footer>
);

export default function Landing({ brand = "equimind" }) {
  const { setBrand, B } = useTheme();
  useEffect(() => { setBrand(brand); }, [brand]); // eslint-disable-line react-hooks/exhaustive-deps
  if (B.key !== brand) return null;
  return (
    <div data-testid="landing-page">
      <ProductTabs />
      <header className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex gap-8 text-sm text-slate-600">
          <a href="#areas" data-testid="nav-areas-link" className="hover:text-slate-900">{B.focus ? "Ten areas" : "Six areas"}</a>
          <a href="#how" data-testid="nav-how-link" className="hover:text-slate-900">How it works</a>
          <a href="#privacy" data-testid="nav-privacy-link" className="hover:text-slate-900">Privacy</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3"><div className="hidden sm:block"><ThemeToggle /></div>
        <Link to={B.login} data-testid="nav-sign-in-btn" className="h-10 px-5 rounded-full bg-slate-900 text-white text-sm whitespace-nowrap inline-flex items-center hover:bg-slate-700 transition-colors">Sign in</Link></div>
      </header>
      <Hero />
      <AreasSection />
      <HowSection />
      <PrivacySection />
      <Footer />
    </div>
  );
}
