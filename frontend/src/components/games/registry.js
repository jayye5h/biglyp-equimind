import { Sudoku } from "@/components/games/Sudoku";
import { ZeroKata } from "@/components/games/ZeroKata";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { BubblePop, BreathBalloon, ZenSand, Grounding, SteadyBeat, WorryClouds } from "./pack/CalmGames";
import { GratitudeJar, KindnessCards, Affirmation, WordScramble } from "./pack/LiftGames";
import { OddColour, EchoPattern, SlidePuzzle, QuickSums, WordSearch, LightsOut, PatternRecall, CountShapes } from "./pack/FocusGames";
import { ReactionTap, CatchStars, GuessWord, HigherLower, RockPaperScissors } from "./pack/PlayGames";

/** id (matches backend/games.py) -> playable component */
export const GAME_COMPONENTS = {
  sudoku: Sudoku, memory: MemoryMatch, zerokata: ZeroKata,
  "bubble-pop": BubblePop, "breath-balloon": BreathBalloon, "gratitude-jar": GratitudeJar, "odd-colour": OddColour,
  "word-scramble": WordScramble, simon: EchoPattern, "worry-clouds": WorryClouds, "kindness-cards": KindnessCards,
  "slide-puzzle": SlidePuzzle, "reaction-tap": ReactionTap, "quick-sums": QuickSums, "word-search": WordSearch,
  "lights-out": LightsOut, "catch-stars": CatchStars, affirmation: Affirmation, "zen-sand": ZenSand, "guess-word": GuessWord,
  grounding: Grounding, "steady-beat": SteadyBeat, "pattern-recall": PatternRecall, "higher-lower": HigherLower,
  rps: RockPaperScissors, "count-shapes": CountShapes,
};
