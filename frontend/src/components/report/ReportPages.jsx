import { CoverPage, SnapshotPage } from "@/components/report/CoverSnapshot";
import { NarrativePage, PriorityPage } from "@/components/report/NarrativePriority";
import { PlanPage, TrackPage } from "@/components/report/PlanTrack";
import { HelpPage, BodyPage, AboutPage } from "@/components/report/HelpBodyAbout";

export const reportSections = (r) => {
  const s = [
    { id: "cover", label: "Cover" }, { id: "snapshot", label: "Your snapshot" }, { id: "narrative", label: "What you may be going through" },
    ...r.priority_pages.map((p, i) => ({ id: `priority-${i + 1}`, label: `Priority ${i + 1}: ${p.name}` })),
    { id: "plan", label: "14-day starter plan" }, { id: "track", label: "Track & reflect" }, { id: "help", label: "Who can help" },
  ];
  if (r.body_page) s.push({ id: "body", label: "Worth ruling out: your body" });
  s.push({ id: "about", label: "About & declaration" });
  return s;
};

export const ReportPages = ({ r, onSave, print }) => {
  const total = r.body_page ? 11 : 10;
  let n = 0;
  const next = () => ++n;
  return (
    <div className="space-y-6">
      <CoverPage r={r} n={next()} total={total} />
      <SnapshotPage r={r} n={next()} total={total} print={print} />
      <NarrativePage r={r} n={next()} total={total} />
      {r.priority_pages.map((p, i) => <PriorityPage key={p.area} p={p} idx={i} n={next()} total={total} />)}
      <PlanPage r={r} n={next()} total={total} onSave={onSave} />
      <TrackPage r={r} n={next()} total={total} onSave={onSave} />
      <HelpPage r={r} n={next()} total={total} />
      {r.body_page && <BodyPage r={r} n={next()} total={total} />}
      <AboutPage r={r} n={next()} total={total} />
    </div>
  );
};
