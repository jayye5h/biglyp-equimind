import { elapsedDays } from "@/lib/progress";

export const PHASES = [
  { n: 1, name: "Finding Calm", short: "Finding Calm", from: 1, to: 3 },
  { n: 2, name: "Feeling Happier & More Energetic", short: "Happier & Energetic", from: 4, to: 8 },
  { n: 3, name: "Connecting, Engaging & Enjoying", short: "Connecting & Enjoying", from: 9, to: 12 },
  { n: 4, name: "Confident, Social & Lively", short: "Confident & Lively", from: 13, to: 14 },
];

export const STAGES = [
  "Feeling a bit overwhelmed", "A little calmer today", "More relaxed and balanced", "Feeling more focused",
  "Calmer and more positive", "More energetic and motivated", "Feeling good and more confident", "Feeling lighter and more active",
  "Enjoying time with a friend", "Feeling more connected", "Enjoying music and feeling good", "More expressive and lively",
  "More social and self-assured", "Confident, happy and ready for what's next",
].map((caption, i) => ({ n: i + 1, caption, src: `/avatars/stages/stage${i + 1}.webp` }));

export const phaseOf = (stage) => PHASES.find((p) => stage >= p.from && stage <= p.to) || PHASES[0];

const clamp = (n) => Math.max(1, Math.min(14, n));

/** Progress stage reached by journey day d (0-based). Grows only with completed daily check-ins, never goes back. */
export const stageAt = (r, d) => clamp(1 + (r?.logged_days || []).filter((k) => k <= d).length);

export const todayIndex = (r) => Math.min(Math.max(elapsedDays(r), 0), 13);

export const currentStage = (r) => (r ? clamp(1 + (r.logged_days || []).length) : 1);

/** For future days: the stage the student reaches if they keep checking in. */
export const projectedStage = (r, d) => clamp(currentStage(r) + (d - todayIndex(r)));
