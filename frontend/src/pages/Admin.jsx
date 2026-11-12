import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Search, Lock, Clock } from "lucide-react";
import { AppHeader } from "@/components/Shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, AREA_COLORS } from "@/lib/api";
import { MediaManager } from "@/components/admin/MediaManager";
import { GamesLibrary } from "@/components/admin/GamesLibrary";
import { NotificationsManager } from "@/components/admin/NotificationsManager";

const Stat = ({ label, value, testid }) => (
  <div data-testid={testid} className="rounded-2xl bg-white border border-eq/10 p-5"><div className="text-xs font-mono uppercase text-slate-400">{label}</div><div className="mt-2 font-serif text-3xl font-bold text-slate-900">{value}</div></div>
);

const Overview = () => {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then((r) => setS(r.data));
  }, []);
  if (!s) return <div className="h-60 rounded-2xl bg-white/60 animate-pulse" />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat testid="stat-checkins" label="Check-ins" value={s.suppressed ? "—" : s.total_checkins} />
        <Stat testid="stat-students" label="Students" value={s.suppressed ? "—" : s.students} />
        <Stat testid="stat-avg-overall" label="Avg overall" value={s.suppressed ? "—" : s.avg_overall} />
        <Stat testid="stat-counsellor-path" label="Counsellor path" value={s.suppressed ? "—" : s.path_split.counsellor} />
      </div>
      {s.suppressed ? (
        <div data-testid="cohort-suppressed" className="rounded-2xl bg-white border border-dashed border-eq/30 p-8 flex gap-4"><Lock className="h-5 w-5 text-eq shrink-0" />
          <p className="text-slate-600">Aggregate numbers appear only when at least {s.min_cohort} students have checked in, so no individual can be identified. No identified student responses are ever shown here.</p></div>
      ) : (
        <div className="rounded-2xl bg-white border border-eq/10 p-6">
          <h3 className="font-serif text-xl font-semibold">Average area scores (latest check-in per student, anonymous)</h3>
          <div className="h-72 mt-4" data-testid="admin-area-chart">
            <ResponsiveContainer><BarChart data={s.areas}><XAxis dataKey="short" fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} width={28} /><Tooltip />
              <Bar dataKey="avg" radius={[8, 8, 0, 0]}>{s.areas.map((a) => <Cell key={a.key} fill={AREA_COLORS[a.key]} />)}</Bar></BarChart></ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionBank = () => {
  const [data, setData] = useState(null);
  const [area, setArea] = useState("all");
  const [q, setQ] = useState("");
  useEffect(() => {
    api.get("/admin/items").then((r) => setData(r.data));
  }, []);
  const rows = useMemo(() => (data ? data.items.filter((i) => (area === "all" || i.area === area) && i.text.toLowerCase().includes(q.toLowerCase())) : []), [data, area, q]);
  if (!data) return <div className="h-60 rounded-2xl bg-white/60 animate-pulse" />;
  const sub = Object.fromEntries(data.subthemes.map((s) => [s.key, s.name]));
  return (
    <div className="rounded-2xl bg-white border border-eq/10 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" /><input data-testid="item-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items…" className="w-full h-10 pl-9 pr-3 rounded-xl bg-eq-bg outline-none focus:ring-2 focus:ring-eq" /></div>
        <select data-testid="item-area-filter" value={area} onChange={(e) => setArea(e.target.value)} className="h-10 px-3 rounded-xl bg-eq-bg outline-none">
          <option value="all">All areas</option>{data.areas.map((a) => <option key={a.key} value={a.key}>{a.name}</option>)}
        </select>
      </div>
      <p data-testid="item-count" className="mt-4 text-xs font-mono text-slate-500">{rows.length} of {data.items.length} items · one item drawn per sub-theme (24 per check-in)</p>
      <div className="mt-3 max-h-[560px] overflow-y-auto divide-y divide-slate-100">
        {rows.map((i) => (
          <div key={i.id} data-testid={`item-row-${i.id}`} className="py-3 flex gap-4"><span className="font-mono text-xs w-14 shrink-0 pt-0.5" style={{ color: AREA_COLORS[i.area] }}>{i.id}</span>
            <div><div className="text-sm text-slate-800">{i.text}</div><div className="text-xs text-slate-400 mt-0.5">{sub[i.subtheme]}</div></div></div>
        ))}
      </div>
    </div>
  );
};

const Library = () => {
  const [acts, setActs] = useState(null);
  useEffect(() => {
    api.get("/admin/activities").then((r) => setActs(r.data));
  }, []);
  if (!acts) return <div className="h-60 rounded-2xl bg-white/60 animate-pulse" />;
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {acts.map((a, i) => (
        <div key={`${a.area}-${a.id}`} data-testid={`activity-card-${i}`} className="rounded-2xl bg-white border border-eq/10 p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: AREA_COLORS[a.area] }}>{a.area_name}</span>
          <h4 className="mt-1.5 font-semibold text-slate-800">{a.name}</h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time}</p>
          <p className="text-sm text-slate-600 mt-3">{a.when}</p>
        </div>
      ))}
    </div>
  );
};

export default function Admin() {
  return (
    <div data-testid="admin-page" className="min-h-screen">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-eq">Platform admin</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-slate-900">Content &amp; <em className="text-eq">cohort view</em></h1>
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-white border border-eq/10 rounded-3xl sm:rounded-full p-1 h-auto flex flex-wrap justify-start max-w-full">
            <TabsTrigger data-testid="admin-tab-overview" value="overview" className="rounded-full data-[state=active]:bg-eq data-[state=active]:text-white px-4">Overview</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-items" value="items" className="rounded-full data-[state=active]:bg-eq data-[state=active]:text-white px-4">Question bank</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-activities" value="activities" className="rounded-full data-[state=active]:bg-eq data-[state=active]:text-white px-4">Activities</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-media" value="media" className="rounded-full data-[state=active]:bg-eq data-[state=active]:text-white px-4">Media</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-games" value="games" className="rounded-full data-[state=active]:bg-eq data-[state=active]:text-white px-4">Games</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-notifications" value="notifications" className="rounded-full data-[state=active]:bg-eq data-[state=active]:text-white px-4">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6"><Overview /></TabsContent>
          <TabsContent value="items" className="mt-6"><QuestionBank /></TabsContent>
          <TabsContent value="activities" className="mt-6"><Library /></TabsContent>
          <TabsContent value="media" className="mt-6"><MediaManager /></TabsContent>
          <TabsContent value="games" className="mt-6"><GamesLibrary /></TabsContent>
          <TabsContent value="notifications" className="mt-6"><NotificationsManager /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
