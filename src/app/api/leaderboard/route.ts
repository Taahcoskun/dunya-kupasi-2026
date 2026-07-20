import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPointsBreakdown } from "@/lib/points";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const usersData = await prisma.user.findMany({
      where: {
        AND: [
          { username: { not: "ADMIN" } },
          { role: { not: "ADMIN" } }
        ]
      },
      orderBy: {
        totalPoints: 'desc',
      },
      select: {
        id: true,
        username: true,
        totalPoints: true,
        extraPrediction: {
          select: {
            topScorer: true,
            topAssister: true,
            winnerTeam: true,
            bestPlayer: true,
          }
        },
        predictions: {
          select: {
            pointsAwarded: true,
            predictedHomeScore: true,
            predictedAwayScore: true,
            predictedHomeExtraScore: true,
            predictedAwayExtraScore: true,
            penaltyWinner: true,
            match: {
              select: {
                kickoffTime: true,
                homeScore: true,
                awayScore: true,
                homeExtraScore: true,
                awayExtraScore: true,
                penaltyWinner: true,
              }
            }
          }
        }
      },
    });

    const week3End = new Date("2026-06-28T10:00:00Z").getTime();

    let users = usersData.map(user => {
      let groupPoints = 0;
      let round32Points = 0;
      let round16Points = 0;
      let quarterFinalsPoints = 0;
      let semiFinalsPoints = 0;
      let finalPoints = 0;
      let exactHits = 0;
      let onePoints = 0;
      let totalPlayed = 0;

      user.predictions.forEach(p => {
        if (p.pointsAwarded !== null && p.pointsAwarded !== undefined) {
          totalPlayed++;
          
          const bd = getPointsBreakdown(p.match, p as any);
          if (bd.score90Mins === 4) {
            exactHits++;
          } else if (bd.score90Mins === 1) {
            onePoints++;
          }
          
          const kickoff = new Date(p.match.kickoffTime).getTime();
          if (kickoff < week3End) {
            groupPoints += p.pointsAwarded;
          } else if (kickoff < new Date("2026-07-04T10:00:00Z").getTime()) {
            round32Points += p.pointsAwarded;
          } else if (kickoff < new Date("2026-07-09T00:00:00Z").getTime()) {
            round16Points += p.pointsAwarded;
          } else if (kickoff < new Date("2026-07-13T00:00:00Z").getTime()) {
            quarterFinalsPoints += p.pointsAwarded;
          } else if (kickoff < new Date("2026-07-16T00:00:00Z").getTime()) {
            semiFinalsPoints += p.pointsAwarded;
          } else {
            finalPoints += p.pointsAwarded;
          }
        }
      });

      let extraPoints = 0;
      if (user.extraPrediction) {
        const topScorer = user.extraPrediction.topScorer?.toLowerCase() || '';
        const topAssister = user.extraPrediction.topAssister?.toLowerCase() || '';
        const winnerTeam = user.extraPrediction.winnerTeam?.toLowerCase() || '';
        const bestPlayer = user.extraPrediction.bestPlayer?.toLowerCase() || '';

        if (topScorer.includes('mbappe') || topScorer.includes('mpappe') || topScorer.includes('mbabbe')) extraPoints += 5;
        if (topAssister.includes('olise')) extraPoints += 5;
        if (winnerTeam.includes('ispanya') || winnerTeam.includes('spain') || winnerTeam.includes('i̇spanya')) extraPoints += 5;
        if (bestPlayer.includes('rodri')) extraPoints += 5;
      }

      return {
        id: user.id,
        username: user.username,
        totalPoints: user.totalPoints + extraPoints,
        groupPoints,
        round32Points,
        round16Points,
        quarterFinalsPoints,
        semiFinalsPoints,
        finalPoints,
        extraPoints,
        exactHits,
        onePoints,
        totalPlayed
      };
    });

    // Averaj System: Sort by totalPoints -> exactHits (4P) -> onePoints (1P)
    users.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
      return b.onePoints - a.onePoints;
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
