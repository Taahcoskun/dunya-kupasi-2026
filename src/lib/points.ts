export function calculatePoints(
  match: {
    kickoffTime: Date | string;
    homeScore: number | null;
    awayScore: number | null;
    homeExtraScore: number | null;
    awayExtraScore: number | null;
    penaltyWinner: string | null;
  },
  pred: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    predictedHomeExtraScore: number | null;
    predictedAwayExtraScore: number | null;
    penaltyWinner: string | null;
  }
): number {
  let points = 0;

  const actualHome = match.homeScore;
  const actualAway = match.awayScore;
  const predHome = pred.predictedHomeScore;
  const predAway = pred.predictedAwayScore;

  if (actualHome === null || actualAway === null) return 0;

  // 1. 90 minutes outcome
  const actualOutcome = actualHome > actualAway ? "HOME" : actualHome < actualAway ? "AWAY" : "DRAW";
  const predOutcome = predHome > predAway ? "HOME" : predHome < predAway ? "AWAY" : "DRAW";

  const isKnockout = new Date(match.kickoffTime) >= new Date("2026-06-28T10:00:00Z");

  if (actualOutcome === predOutcome) {
    if (actualHome === predHome && actualAway === predAway) {
      points += 3; // exact score (skor bilme 3 puan)
    } else {
      points += 1; // outcome correct (taraf bilme 1 puan)
    }
  }

  // If it's a knockout match, calculate extra time and penalty points
  if (isKnockout) {
    const actualWentToExtra = actualOutcome === "DRAW";
    const predWentToExtra = predOutcome === "DRAW";

    if (predWentToExtra) {
      if (actualWentToExtra) {
        // Correctly predicted that it goes to extra time (+1 point)
        points += 1;

        // Now calculate Extra Time points
        const actualHomeExtra = match.homeExtraScore;
        const actualAwayExtra = match.awayExtraScore;
        const predHomeExtra = pred.predictedHomeExtraScore;
        const predAwayExtra = pred.predictedAwayExtraScore;

        if (actualHomeExtra !== null && actualAwayExtra !== null && predHomeExtra !== null && predAwayExtra !== null) {
          const actualExtraOutcome = actualHomeExtra > actualAwayExtra ? "HOME" : actualHomeExtra < actualAwayExtra ? "AWAY" : "DRAW";
          const predExtraOutcome = predHomeExtra > predAwayExtra ? "HOME" : predHomeExtra < predAwayExtra ? "AWAY" : "DRAW";

          // Correct Extra Time outcome (+1 point)
          if (actualExtraOutcome === predExtraOutcome) {
            points += 1;
            // Correct Extra Time exact score (+1 point)
            if (actualHomeExtra === predHomeExtra && actualAwayExtra === predAwayExtra) {
              points += 1;
            }
          }

          // Penalties
          const actualWentToPenalties = actualExtraOutcome === "DRAW";
          const predWentToPenalties = predExtraOutcome === "DRAW";

          if (predWentToPenalties) {
            if (actualWentToPenalties) {
              // Correctly predicted penalties (+1 point)
              points += 1;

              // Correct penalty winner (+1 point)
              if (pred.penaltyWinner && pred.penaltyWinner === match.penaltyWinner) {
                points += 1;
              }
            } else {
              // Predicted penalties but it ended in extra time (-1 point)
              points -= 1;
            }
          }
        }
      } else {
        // Predicted extra time but it did not go to extra time (-1 point)
        points -= 1;
      }
    }
  }

  return points;
}
