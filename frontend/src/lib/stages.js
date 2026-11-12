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

/** Avatar image for a stage; FocusEdge has its own 3D avatar set. */
export const stageSrc = (n, programme) => (programme === "focusedge" ? `/avatars/fe/stage${n}.webp` : `/avatars/stages/stage${n}.webp`);

export const phaseOf = (stage) => PHASES.find((p) => stage >= p.from && stage <= p.to) || PHASES[0];

const clamp = (n) => Math.max(1, Math.min(14, n));

/** "Yes, I did" activities needed to grow one stage. */
export const PER_STAGE = 5;

/** Plan activities the student actually completed ("Yes" answers) on or before journey day d. */
export const doneUpTo = (r, d = 13) => (r?.ticks || []).filter((t) => Number(String(t).split("-")[1]) <= d).length;

/** Progress stage reached by journey day d (0-based). Grows bit by bit with completed activities (every PER_STAGE = one stage);
 *  days with little or no progress keep the stage where it is — it never goes back. */
export const stageAt = (r, d) => clamp(1 + Math.floor(doneUpTo(r, d) / PER_STAGE));

export const todayIndex = (r) => Math.min(Math.max(elapsedDays(r), 0), 13);

export const currentStage = (r) => (r ? stageAt(r, 13) : 1);

/** Completed activities still needed to reach the next stage (0 once the final stage is reached). */
export const toNextStage = (r) => (currentStage(r) >= 14 ? 0 : PER_STAGE - (doneUpTo(r) % PER_STAGE));
