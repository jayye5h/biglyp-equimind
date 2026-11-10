import { CoverPage, SnapshotPage } from "@/components/report/CoverSnapshot";
import { NarrativePage, PriorityPage } from "@/components/report/NarrativePriority";
import { PlanPage } from "@/components/report/PlanTrack";
import { HelpPage, BodyPage, AboutPage } from "@/components/report/HelpBodyAbout";
import { Week1Page, Week2Page, NextStepsPage } from "@/components/report/ProgressPages";
import { elapsedDays } from "@/lib/progress";

export const reportSections = (r) => {
  const s = [
    { id: "cover", label: "Cover" }, { id: "snapshot", label: "Your snapshot" }, { id: "narrative", label: "What you may be going through" },
    ...r.priority_pages.map((p, i) => ({ id: `priority-${i + 1}`, label: `Priority ${i + 1}: ${p.name}` })),
    { id: "plan", label: "Your 14-day plan" },
    ...(elapsedDays(r) >= 7 ? [{ id: "week-1", label: "Week 1 progress" }] : []),
    ...(elapsedDays(r) >= 14 ? [{ id: "week-2", label: "Week 2 progress" }, { id: "next-steps", label: "Your next steps" }] : []),
    { id: "help", label: "Who can help" },
  ];
  if (r.body_page) s.push({ id: "body", label: "Worth ruling out: your body" });
  s.push({ id: "about", label: "About & declaration" });
  return s;
};

export const ReportPages = ({ r, onSave, print }) => {
  const days = elapsedDays(r);
  const pages = [
    (p) => <CoverPage key="cover" r={r} {...p} />,
    (p) => <SnapshotPage key="snap" r={r} print={print} {...p} />,
    (p) => <NarrativePage key="narr" r={r} {...p} />,
    ...r.priority_pages.map((pp, i) => (p) => <PriorityPage key={pp.area} p={pp} idx={i} {...p} />),
    (p) => <PlanPage key="plan" r={r} {...p} />,
    ...(days >= 7 ? [(p) => <Week1Page key="w1" r={r} {...p} />] : []),
    ...(days >= 14 ? [(p) => <Week2Page key="w2" r={r} {...p} />, (p) => <NextStepsPage key="next" r={r} {...p} />] : []),
    (p) => <HelpPage key="help" r={r} {...p} />,
    ...(r.body_page ? [(p) => <BodyPage key="body" r={r} {...p} />] : []),
    (p) => <AboutPage key="about" r={r} {...p} />,
  ];
  const total = pages.length;
  return <div className="space-y-6">{pages.map((fn, i) => fn({ n: i + 1, total }))}</div>;
};
