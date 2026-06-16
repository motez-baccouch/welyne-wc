/**
 * Welyne custom scoring:
 *   - Exact score .............. 5 pts
 *   - Correct goal difference .. 3 pts  (right outcome + same GD, but not exact)
 *   - Correct outcome only ..... 2 pts  (right W/D/L, wrong GD)
 *   - Wrong outcome ............ 0 pts
 *   - Knockout matches ......... base x 1.5 (rounded)
 */

export const POINTS = {
  EXACT: 5,
  GOAL_DIFF: 3,
  OUTCOME: 2,
  WRONG: 0,
  KNOCKOUT_MULTIPLIER: 1.5,
  CHAMPION_BONUS: 15, // correct tournament winner pick
};

export const KNOCKOUT_STAGES = ["R32", "R16", "QF", "SF", "THIRD", "FINAL"];

function outcome(h: number, a: number): "H" | "D" | "A" {
  if (h > a) return "H";
  if (h < a) return "A";
  return "D";
}

export function scorePrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  stage: string
): number {
  let base: number;

  if (predHome === actualHome && predAway === actualAway) {
    base = POINTS.EXACT;
  } else if (outcome(predHome, predAway) !== outcome(actualHome, actualAway)) {
    base = POINTS.WRONG;
  } else if (predHome - predAway === actualHome - actualAway) {
    // same outcome AND same goal difference (covers draws with matching diff)
    base = POINTS.GOAL_DIFF;
  } else {
    base = POINTS.OUTCOME;
  }

  if (base > 0 && KNOCKOUT_STAGES.includes(stage)) {
    return Math.round(base * POINTS.KNOCKOUT_MULTIPLIER);
  }
  return base;
}
