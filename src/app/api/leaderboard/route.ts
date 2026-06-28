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

    const week1End = new Date("2026-06-18T12:00:00Z").getTime();
    const week2End = new Date("2026-06-24T12:00:00Z").getTime();
    const week3End = new Date("2026-06-28T10:00:00Z").getTime();

    let users = usersData.map(user => {
      let week1Points = 0;
      let week2Points = 0;
      let week3Points = 0;
      let round32Points = 0;
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
          if (kickoff < week1End) {
            week1Points += p.pointsAwarded;
          } else if (kickoff < week2End) {
            week2Points += p.pointsAwarded;
          } else if (kickoff < week3End) {
            week3Points += p.pointsAwarded;
          } else {
            round32Points += p.pointsAwarded;
          }
        }
      });

      return {
        id: user.id,
        username: user.username,
        totalPoints: user.totalPoints,
        week1Points,
        week2Points,
        week3Points,
        round32Points,
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
