/** Age-appropriate wording for the 14-day journey (dashboard journey card, streak card, daily check-in).
 *  One engine, four voices: EquiMind (university), MindMellow (Class 11-12), MindEdge (Class 9-10), FocusEdge (Class 6-8). */
import { PHASES } from "@/lib/stages";

const EQ = {
  title: "Your 14-Day Wellness Journey",
  intro: "Your journey starts with today's check-in. Every activity you complete helps your avatar grow.",
  streak: "Calm Streak", streakUnit: "day streak",
  phases: PHASES.map((p) => [p.name, p.short]),
  captions: [
    "Feeling a bit overwhelmed", "A little calmer today", "More relaxed and balanced", "Feeling more focused",
    "Calmer and more positive", "More energetic and motivated", "Feeling good and more confident", "Feeling lighter and more active",
    "Enjoying time with a friend", "Feeling more connected", "Enjoying music and feeling good", "More expressive and lively",
    "More social and self-assured", "Confident, happy and ready for what's next",
  ],
  badges: ["First Step", "Finding Calm", "Balanced", "Focused", "Bright Mind", "Energised", "Confident", "Lighter", "Good Company", "Connected", "In Tune", "Expressive", "Self-Assured", "Ready for What's Next"],
  moodTitles: ["Taking It Slow", "Hanging In There", "Finding Your Feet", "Feeling More Calm", "Feeling Bright"],
  moodShort: ["Struggling", "Rough day", "Settling", "Calmer", "More Open"],
  moodDesc: [
    "Today feels heavy. That's okay — one small step from your plan is enough.",
    "A tough day, and you're still showing up. Be gentle with yourself.",
    "Things are settling. Small habits are starting to hold you steady.",
    "You feel less stressed, a bit more focused, and more open to connecting with others.",
    "You're feeling strong today. Notice what helped, so you can repeat it.",
  ],
  quotes: ["Small, consistent steps quietly create a happier you.", "Progress, not perfection.", "Rest is part of the work.", "You don't have to do it all today.",
    "One honest sentence can lighten the load.", "Your pace is still progress.", "Tomorrow is the restart, not next Monday."],
  nextLabel: "Next up from your plan",
  strong: "A Strong Day", some: "Small Steps Taken", one: "One Step Forward", none: "Checked In",
};

const MM = {
  ...EQ,
  title: "Your 14-Day Exam-Season Journey",
  intro: "Boards, entrance prep and big decisions — start with today's check-in. Every activity you complete helps your avatar grow.",
  streak: "Steady Streak",
  phases: [["Settling In", "Settling In"], ["Finding Your Study Rhythm", "Study Rhythm"], ["Balancing Prep & Rest", "Prep & Rest"], ["Ready & Resilient", "Ready & Resilient"]],
  captions: [
    "Feeling the exam pressure", "A little calmer about prep", "Breathing easier between study blocks", "Focused on one subject at a time",
    "More positive about the syllabus", "Energy back for revision", "Confident about the plan", "Lighter and back on track",
    "Studying alongside a friend", "Feeling supported by people around", "Music breaks that recharge", "Expressing yourself beyond marks",
    "Self-assured about your choices", "Calm, confident and exam-ready",
  ],
  badges: ["First Step", "Deep Breath", "Study Rhythm", "One Subject at a Time", "Positive Prep", "Recharged", "Plan Believer", "Back on Track", "Study Buddy", "Supported", "Recharge Break", "More Than Marks", "Clear Choices", "Exam-Ready"],
  moodTitles: ["Pressure Feels High", "Pushing Through", "Getting There", "Steadier Today", "Ready to Take It On"],
  moodShort: ["Pressured", "Tough day", "Getting there", "Steadier", "Ready"],
  moodDesc: [
    "The pressure feels big today. One tiny step from your plan is enough — marks can wait for a breath.",
    "A tough study day, and you still checked in. That's discipline, not weakness.",
    "You're finding your feet between prep and rest. Keep the small habits going.",
    "Steadier today — the plan is working. Protect your sleep tonight.",
    "You feel ready. Use this energy for one focused study block, then rest properly.",
  ],
  quotes: ["One chapter at a time is still progress.", "Rest is part of revision.", "Your worth is bigger than any rank.", "A calm mind remembers more.",
    "Small daily steps beat last-minute marathons.", "Ask for help early — it's a smart move.", "Tomorrow's paper needs tonight's sleep."],
  nextLabel: "Next study-season step",
  strong: "A Steady Prep Day", some: "Good Progress", one: "One Step Forward", none: "Checked In",
};

const ME = {
  ...EQ,
  title: "Your 14-Day Balance Journey",
  intro: "School, friends, sleep and screens — start with today's check-in. Every activity you complete helps your avatar grow.",
  streak: "Wave Streak",
  phases: [["Calm Waters", "Calm Waters"], ["Building Better Habits", "Better Habits"], ["Sailing Steady", "Sailing Steady"], ["Confident Captain", "Confident Captain"]],
  captions: [
    "Things feel a bit much", "A little calmer today", "Finding your balance", "Focusing in class",
    "More positive about school", "More energy after school", "Feeling good about yourself", "Lighter and more active",
    "Hanging out with a friend", "Feeling more connected", "Music that lifts your mood", "Showing who you really are",
    "Confident with your friends", "Happy, balanced and ready",
  ],
  badges: ["First Step", "Calm Waters", "Balanced", "Class Focus", "Bright Side", "Energy Up", "Self-Belief", "Lighter", "Good Friends", "Connected", "Mood Music", "Be You", "Confident Crew", "Ready to Sail"],
  moodTitles: ["Rough Waters Today", "Hanging In There", "Finding Your Balance", "Feeling Steadier", "Feeling Great"],
  moodShort: ["Rough", "Tough day", "Okay", "Steadier", "Great"],
  moodDesc: [
    "Today feels heavy. Talk to someone you trust and do just one small thing from your plan.",
    "A tough day at school or home — and you still showed up. That counts.",
    "You're finding your balance between school, screens and rest.",
    "Steadier today. Your habits are starting to help.",
    "You're feeling great! Notice what helped so you can do it again.",
  ],
  quotes: ["Small steps make big waves.", "It's okay to log off and rest.", "Real friends like the real you.", "Sleep is your secret study tool.",
    "Asking for help is brave.", "One good day at a time.", "Tomorrow is a fresh start."],
  nextLabel: "Next up from your plan",
  strong: "A Great Day", some: "Good Effort", one: "One Step Forward", none: "Checked In",
};

const FE = {
  ...EQ,
  title: "Your 14-Day Focus Journey",
  intro: "Your focus adventure starts with today's check-in. Every tiny mission you finish helps your avatar grow!",
  streak: "Focus Streak", streakUnit: "days in a row",
  phases: [["Noticing", "Noticing"], ["Starting Small", "Starting Small"], ["Building Focus", "Building Focus"], ["Focused & Confident", "Focused & Confident"]],
  captions: [
    "Brain feels busy and tired", "A little calmer today", "Relaxed and ready to try", "Eyes on one task",
    "Smiling at small wins", "Energy for homework", "Proud of finishing", "Cheering for yourself",
    "Studying with a buddy", "Helping each other", "A happy music break", "Creative and lively",
    "Brave in class", "Focused, confident and ready!",
  ],
  badges: ["First Mission", "Calm Start", "Ready to Try", "Eyes on Task", "Small Wins", "Homework Energy", "Finisher", "Cheerleader", "Study Buddy", "Team Player", "Music Break", "Creative Spark", "Brave Hand-Raiser", "Focus Champion"],
  moodTitles: ["A Tough Day", "A Wobbly Day", "An Okay Day", "A Good Day", "A Great Day!"],
  moodShort: ["Tough", "Wobbly", "Okay", "Good", "Great"],
  moodDesc: [
    "Today feels hard. Tell a grown-up you trust, and do just one tiny mission — that's enough.",
    "A wobbly day, and you still checked in. That's being brave!",
    "An okay day. A 2-minute start can make it even better.",
    "A good day! Your focus habits are starting to work.",
    "A great day! Remember what helped, so you can do it again tomorrow.",
  ],
  quotes: ["Tiny steps, big wins.", "Starting is the hardest part — and you did it!", "Mistakes help your brain grow.", "Phone away, brain on!",
    "Asking questions is smart.", "Two minutes is enough to begin.", "Tomorrow is a brand-new try."],
  nextLabel: "Your next tiny mission",
  strong: "Mission Champion!", some: "Missions Done!", one: "One Mission Done", none: "Checked In",
};

EQ.ask = "How are you today?"; MM.ask = "How's prep feeling today?"; ME.ask = "How's your day going?"; FE.ask = "How's your brain feeling today?";
EQ.grade = "University"; MM.grade = "Class 11–12"; ME.grade = "Class 9–10"; FE.grade = "Class 6–8";
EQ.focusLine = "Wellbeing habits for college life"; MM.focusLine = "Calm habits for boards & entrance prep"; ME.focusLine = "Balance for school, friends, sleep & screens"; FE.focusLine = "Tiny focus missions for study time";

const COPY = { equimind: EQ, mindmellow: MM, mindedge: ME, focusedge: FE };

export const journeyCopy = (programme) => COPY[programme] || EQ;

/** Phase (1-4) for a stage, named for the programme. */
export const phaseFor = (stage, programme) => {
  const p = PHASES.find((x) => stage >= x.from && stage <= x.to) || PHASES[0];
  const [name, short] = journeyCopy(programme).phases[p.n - 1];
  return { ...p, name, short };
};

export const captionFor = (stage, programme) => journeyCopy(programme).captions[Math.max(1, Math.min(14, stage)) - 1];
