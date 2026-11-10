import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toneVars } from "@/lib/featureTones";
import { SafetyStrip } from "@/components/Shell";
import { HomeLayout, NoReportCard } from "@/components/home/HomeLayout";
import { JourneyCard } from "@/components/home/JourneyCard";
import { CalmShorts, Audiobooks, usePlayer } from "@/components/home/MediaSections";
import { ActivityOfDay, MoreGames } from "@/components/home/ActivityOfDay";
import { WellnessReads, AllReads } from "@/components/home/WellnessReads";
import { StreakCard, streakInfo, BADGES } from "@/components/home/CalmStreak";
import { PlanSummary, TrackSummary, MoodWeek } from "@/components/DashboardActions";
import { HelpContent } from "@/components/report/HelpBodyAbout";
import { pendingDay } from "@/components/DailyCheckin";
import { DailyLog } from "@/components/DailyLog";
import { LatestCard, History } from "@/pages/Dashboard";

const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

const Greeting = ({ name, hasReport }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 eq-rise">
    <h1 data-testid="dashboard-greeting" className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">{greet()}, {name}!</h1>
    {hasReport && <Link to="/check-in" data-testid="start-checkin-btn" className="self-start sm:self-auto h-11 px-5 rounded-xl bg-white border border-eq/20 text-sm font-medium text-slate-700 hover:border-eq/50 inline-flex items-center gap-2 transition-colors">Take a new check-in <ArrowRight className="h-4 w-4" /></Link>}
  </div>
);

export default function StudentHome() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "home";
  const [reports, setReports] = useState(null);
  const [latest, setLatest] = useState(null);
  const [media, setMedia] = useState([]);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [allReads, setAllReads] = useState(null);
  const [planTick, setPlanTick] = useState(0);
  const { play, player } = usePlayer();

  useEffect(() => {
    api.get("/reports").then((r) => {
      setReports(r.data);
      if (r.data[0]) api.get(`/reports/${r.data[0].id}`).then((x) => setLatest(x.data));
    });
    api.get("/media").then((r) => setMedia(r.data));
  }, []);

  const day = latest ? pendingDay(latest) : null;

  useEffect(() => {
    if (reports === null || (reports.length && !latest)) return;
    api.get("/wellness/today").then((r) => setPlan(r.data)).catch(() => setPlan(null));
  }, [reports, latest?.id, planTick]);

  useEffect(() => {
    if (tab === "toolkit" && !allReads) api.get("/wellness/reads").then((r) => setAllReads(r.data));
  }, [tab, allReads]);

  useEffect(() => {
    if (day !== null && !sessionStorage.getItem(`eq-daily-${latest.id}-${day}`)) setDailyOpen(true);
  }, [day, latest]);

  const save = (patch) => {
    const before = streakInfo(latest).earned;
    const after = streakInfo({ ...latest, ...patch });
    setLatest((p) => ({ ...p, ...patch }));
    api.patch(`/reports/${latest.id}/progress`, patch).then(() => {
      if (patch.moods) { setPlanTick((t) => t + 1); setAllReads(null); }
      if (patch.logged_days && after.earned > before) {
        const b = BADGES[Math.min(after.earned, 14) - 1];
        toast.success(`New badge: ${b.name}`, { description: after.current > 1 ? `${after.current}-day streak! ${b.msg}` : b.msg });
      } else toast.success(patch.logged_days ? "Saved to your plan" : "Mood logged");
    }).catch(() => toast.error("Could not save. Please try again."));
  };
  const closeDaily = () => {
    sessionStorage.setItem(`eq-daily-${latest.id}-${day}`, "1");
    setDailyOpen(false);
  };
  const openDaily = () => {
    if (day !== null) setDailyOpen(true);
    else toast.success(latest ? "You're all caught up for today." : "Take your first check-in to start your daily check-ins.");
  };
  const nav = (id) => {
    if (id === "checkin") return openDaily();
    setParams(id === "home" ? {} : { tab: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toToolkit = () => nav("toolkit");
  const shorts = media.filter((m) => m.kind === "short");
  const ready = reports !== null && (!reports.length || latest);

  return (
    <HomeLayout tab={tab} onNav={nav} pending={day} onBell={openDaily}>
      <Greeting name={user.name.split(" ")[0]} hasReport={!!reports?.length} />
      {!ready ? <div className="h-80 rounded-[2rem] bg-white/60 animate-pulse" /> : (
        <div data-testid={`dashboard-tab-${tab}`} className="space-y-7">
          {tab === "home" && (<>
            {latest ? <JourneyCard r={latest} onSave={save} pending={day} onOpenDaily={openDaily} /> : <NoReportCard />}
            {latest && <StreakCard r={latest} pending={day} onOpenDaily={openDaily} />}
            <ActivityOfDay plan={plan} />
            <CalmShorts items={shorts} play={play} onAll={toToolkit} />
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 [&>*]:min-w-0 items-start">
              <WellnessReads plan={plan} onAll={toToolkit} />
              <Audiobooks media={media} play={play} onAll={toToolkit} limit={4} />
            </div>
          </>)}
          {tab === "journey" && (latest ? (<>
            <LatestCard r={{ ...reports[0], ticks: latest.ticks }} />
            <StreakCard r={latest} pending={day} onOpenDaily={openDaily} />
            <div className="grid lg:grid-cols-2 gap-6"><PlanSummary r={latest} /><TrackSummary r={latest} /></div>
          </>) : <NoReportCard />)}
          {tab === "insights" && (latest ? (<><MoodWeek r={latest} /><History reports={reports} /></>) : <NoReportCard />)}
          {tab === "toolkit" && (<>
            <ActivityOfDay plan={plan} />
            <MoreGames />
            <CalmShorts items={shorts} play={play} limit={50} />
            <AllReads reads={allReads} />
            <Audiobooks media={media} play={play} limit={50} />
          </>)}
          {tab === "support" && (<>
            {latest && (
              <section data-testid="dashboard-help-section" className="rounded-[2rem] bg-white border border-eq/10 p-6 sm:p-8" style={toneVars(localStorage.getItem("eq_feature_tone"))}>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Who Can Help &amp; When to Ask</h2>
                <div className="mt-6"><HelpContent r={latest} /></div>
              </section>
            )}
            {!latest && <SafetyStrip testid="dashboard-safety-strip" />}
          </>)}
        </div>
      )}
      {latest && day !== null && dailyOpen && <DailyLog r={latest} day={day} open onClose={closeDaily} onSave={save} />}
      {player}
    </HomeLayout>
  );
}
