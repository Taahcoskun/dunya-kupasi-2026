export type PointsBreakdown = {
  score90Mins: number;
  extraTimeGo: number;
  extraTimeOutcome: number;
  penaltyGo: number;
  penaltyWinner: number;
  total: number;
};

export function getPointsBreakdown(
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
): PointsBreakdown {
  let score90Mins = 0;
  let extraTimeGo = 0;
  let extraTimeOutcome = 0;
  let penaltyGo = 0;
  let penaltyWinnerPoints = 0;

  const actualHome = match.homeScore;
  const actualAway = match.awayScore;
  const predHome = pred.predictedHomeScore;
  const predAway = pred.predictedAwayScore;

  if (actualHome !== null && actualAway !== null) {
    // 1. 90 minutes outcome
    const actualOutcome = actualHome > actualAway ? "HOME" : actualHome < actualAway ? "AWAY" : "DRAW";
    const predOutcome = predHome > predAway ? "HOME" : predHome < predAway ? "AWAY" : "DRAW";

    const isKnockout = new Date(match.kickoffTime) >= new Date("2026-06-28T10:00:00Z");

    if (actualOutcome === predOutcome) {
      score90Mins = 1; // outcome correct (taraf bilme 1 puan)
      if (actualHome === predHome && actualAway === predAway) {
        score90Mins += 3; // exact score (+3 ekstra puan = toplam 4)
      }
    }

    // If it's a knockout match, calculate extra time and penalty points
    if (isKnockout) {
      const actualWentToExtra = actualOutcome === "DRAW";
      const predWentToExtra = predOutcome === "DRAW";

      if (predWentToExtra) {
        if (actualWentToExtra) {
          // Correctly predicted that it goes to extra time (+1 point)
          extraTimeGo = 1;

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
              extraTimeOutcome += 1;
              // Correct Extra Time exact score (+1 point)
              if (actualHomeExtra === predHomeExtra && actualAwayExtra === predAwayExtra) {
                extraTimeOutcome += 1;
              }
            }

            // Penalties
            const actualWentToPenalties = actualExtraOutcome === "DRAW";
            const predWentToPenalties = predExtraOutcome === "DRAW";

            if (predWentToPenalties) {
              if (actualWentToPenalties) {
                // Correctly predicted penalties (+1 point)
                penaltyGo = 1;

                // Correct penalty winner (+1 point)
                if (pred.penaltyWinner && pred.penaltyWinner === match.penaltyWinner) {
                  penaltyWinnerPoints = 1;
                }
              } else {
                // Predicted penalties but it ended in extra time (-1 point)
                penaltyGo = -1;
              }
            }
          }
        } else {
          // Predicted extra time but it did not go to extra time (-1 point)
          extraTimeGo = -1;
          
          // If they also predicted penalties, they should lose -1 for that too since it didn't even reach extra time
          const predHomeExtra = pred.predictedHomeExtraScore;
          const predAwayExtra = pred.predictedAwayExtraScore;
          if (predHomeExtra !== null && predAwayExtra !== null) {
            const predExtraOutcome = predHomeExtra > predAwayExtra ? "HOME" : predHomeExtra < predAwayExtra ? "AWAY" : "DRAW";
            if (predExtraOutcome === "DRAW") {
              penaltyGo = -1;
            }
          }
        }
      }
    }
  }

  const total = score90Mins + extraTimeGo + extraTimeOutcome + penaltyGo + penaltyWinnerPoints;

  return {
    score90Mins,
    extraTimeGo,
    extraTimeOutcome,
    penaltyGo,
    penaltyWinner: penaltyWinnerPoints,
    total
  };
}

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
  return getPointsBreakdown(match, pred).total;
}
