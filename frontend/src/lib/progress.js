import { BANDS } from "@/components/report/PlanTrack";

export const elapsedDays = (r) => Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5);

export const weekStats = (r, w) => {
  const ticks = new Set(r.ticks || []);
  const days = Array.from({ length: 7 }, (_, i) => w * 7 + i);
  const acts = r.plan.map((a, i) => ({ short: a.short, name: a.name, done: days.filter((d) => ticks.has(`${i}-${d}`)).length }));
  const total = acts.reduce((s, a) => s + a.done, 0);
  const moodVals = days.map((d) => (r.moods || {})[d]).filter((v) => BANDS[v]);
  const avgMood = moodVals.length ? moodVals.reduce((s, v) => s + v, 0) / moodVals.length : null;
  const sorted = [...acts].sort((a, b) => b.done - a.done);
  const fullDays = days.filter((d) => r.plan.every((_, i) => ticks.has(`${i}-${d}`))).length;
  return { acts, total, fullDays, pct: Math.round((total / 35) * 100), moodDays: moodVals.length, avgMood, best: sorted[0], hardest: sorted[sorted.length - 1] };
};

export const bandName = (v) => (v === null ? null : BANDS[Math.round(v)].l);

export const week1Writeup = (r, s) => {
  const first = r.student.name.split(" ")[0];
  const phrase = s.pct >= 70 ? "a strong start" : s.pct >= 40 ? "a real start you can build on" : "a slow start — and that is information, not failure";
  const parts = [`${first}, in your first week you completed ${s.total} of 35 planned activities (${s.pct}%) — ${phrase}.`];
  if (s.total === 0) parts.push("None of the five activities were ticked this week — that usually means the week got busy, not that you failed.");
  else if (s.best.done > s.hardest.done) parts.push(`${s.best.name} was your most consistent habit (${s.best.done}/7 days), while ${s.hardest.name} was the hardest to keep (${s.hardest.done}/7).`);
  else parts.push(`You kept all five activities at a similar rhythm (${s.best.done}/7 days each).`);
  parts.push(s.moodDays ? `You logged your mood on ${s.moodDays} of 7 days, and it was mostly ${bandName(s.avgMood)}.` : "You didn't log your mood this week — one tap a day on the dashboard helps you see your patterns.");
  parts.push(s.hardest.done <= 2 ? `For Week 2, try just the minimum version of ${s.hardest.name} — even two days counts.` : "For Week 2, keep the same rhythm — consistency matters more than intensity.");
  return parts.join(" ");
};

const num = (v) => (v === undefined || String(v).trim() === "" || Number.isNaN(Number(v)) ? null : Number(v));

export const trendInsights = (r, s1, s2) => {
  const t = r.tracker || {};
  const feel = [num(t["0-0"]), num(t["0-1"]), num(t["0-2"])];
  const improved = s2.acts.filter((a, i) => a.done > s1.acts[i].done);
  const dropped = s2.acts.filter((a, i) => a.done < s1.acts[i].done);
  const out = [];
  const diff = s2.total - s1.total;
  out.push(diff > 0 ? `Your consistency grew: ${s2.total} activities in Week 2 vs ${s1.total} in Week 1 (+${diff}).` : diff < 0 ? `Week 2 was harder to keep up: ${s2.total} activities vs ${s1.total} in Week 1. Busy weeks happen — notice what got in the way.` : `You held a steady rhythm: ${s2.total} activities in each week.`);
  if (improved.length) out.push(`Habits that grew: ${improved.map((a) => a.name).join(", ")}.`);
  if (dropped.length) out.push(`Habits that slipped: ${dropped.map((a) => a.name).join(", ")} — these are the ones to make smaller, not drop.`);
  let moodDown = false;
  if (s1.avgMood !== null && s2.avgMood !== null) {
    const m = s2.avgMood - s1.avgMood;
    moodDown = m < -0.3;
    out.push(m > 0.3 ? `Your mood lifted from mostly ${bandName(s1.avgMood)} to mostly ${bandName(s2.avgMood)}.` : moodDown ? `Your mood dipped from mostly ${bandName(s1.avgMood)} to mostly ${bandName(s2.avgMood)}.` : `Your mood stayed mostly ${bandName(s2.avgMood)} across both weeks.`);
  } else out.push("Log your mood more often next time to see how it moves with your habits.");
  const feelUp = feel[0] !== null && feel[2] !== null ? feel[2] - feel[0] : null;
  if (feelUp !== null) out.push(`Your overall feel went from ${feel[0]} on Day 1 to ${feel[2]} at Week 2 (${feelUp >= 0 ? "+" : ""}${feelUp}).`);
  const notMoving = moodDown || (feelUp !== null && feelUp <= 0) || s2.pct < 40;
  const next = notMoving
    ? `The plan isn't moving things enough yet — ${r.path === 2 ? "keep" : "consider booking"} a campus counsellor appointment and bring it forward. A plan not moving is information, not failure.`
    : "Keep the two habits that helped most, and retake the check-in on Day 30 to see how your six areas have moved.";
  return { lines: out, next, feel, notMoving };
};

export const week2Writeup = (r, s1, s2) => {
  const first = r.student.name.split(" ")[0];
  const diff = s2.total - s1.total;
  const parts = [`${first}, in days 8 to 14 you completed ${s2.total} of 35 activities (${s2.pct}%)${diff > 0 ? ` \u2014 ${diff} more than in your first week. That is real progress.` : diff < 0 ? ` \u2014 a little fewer than Week 1. Busy weeks happen, and you still kept going.` : " \u2014 exactly the same rhythm as Week 1. Steady is strong."}`];
  if (s2.total && s2.best.done > s2.hardest.done) parts.push(`${s2.best.name} was your strongest habit this week (${s2.best.done}/7), and ${s2.hardest.name} needed the most effort (${s2.hardest.done}/7).`);
  parts.push(s2.fullDays ? `On ${s2.fullDays} ${s2.fullDays === 1 ? "day" : "days"} you did all five activities.` : "You didn't manage all five on a single day \u2014 that's a sign the plan may be a little too full right now, not that you failed.");
  return parts.join(" ");
};

export const nextStepsPlan = (r) => {
  const s1 = weekStats(r, 0);
  const s2 = weekStats(r, 1);
  const t = trendInsights(r, s1, s2);
  const pct = Math.round(((s1.total + s2.total) / 70) * 100);
  const ranked = r.plan.map((a, i) => ({ ...a, done: s1.acts[i].done + s2.acts[i].done })).sort((a, b) => b.done - a.done);
  const first = r.student.name.split(" ")[0];
  let path = "same";
  if (s2.pct >= 80 && s2.fullDays >= 4) path = "new";
  else if (s2.pct < 60 || s2.fullDays < 3) path = "three";
  let items;
  let listTitle;
  if (path === "three") {
    listTitle = "Your 3 daily activities for the next two weeks";
    items = ranked.slice(0, 3).map((a) => ({ id: a.id, name: a.name, time: a.time, note: `You managed this on ${a.done} of 14 days \u2014 it already fits your life.` }));
  } else if (path === "new") {
    listTitle = "Keep these two, and add something new";
    const fresh = (r.next_activities || []).slice(0, 2);
    items = [
      ...ranked.slice(0, 2).map((a) => ({ id: a.id, name: a.name, time: a.time, note: "Keep going \u2014 this habit is becoming part of you." })),
      ...fresh.map((a) => ({ id: a.id, name: `New: ${a.name}`, time: a.time, note: a.why })),
    ];
  } else {
    listTitle = "Your same 5 activities \u2014 keep the rhythm";
    items = ranked.map((a) => ({ id: a.id, name: a.name, time: a.time, note: `${a.done} of 14 days so far.` }));
  }
  const intro = path === "three"
    ? `${first}, you completed ${pct}% of your plan over 14 days. Keeping all five every day was hard \u2014 so for the next two weeks we suggest a lighter plan of three activities a day. Fewer habits done well beat many done sometimes.`
    : path === "new"
      ? `${first}, you completed ${pct}% of your plan over 14 days \u2014 that's excellent. You're ready for a fresh challenge, so we suggest adding new activities while keeping your strongest habits.`
      : `${first}, you completed ${pct}% of your plan over 14 days. Your rhythm is building, so the best next step is to continue with the same five habits for two more weeks.`;
  const closing = t.notMoving
    ? `Your mood or progress isn't moving as much as we'd hope yet \u2014 ${r.path === 2 ? "keep" : "consider booking"} a campus counsellor appointment, and bring it forward. A plan not moving is information, not failure.`
    : "Retake your check-in around Day 30 to see how your six areas have moved. Be proud of what you've built.";
  return { path, pct, items, listTitle, intro, closing, notMoving: t.notMoving };
};
