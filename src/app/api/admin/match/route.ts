import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, homeScore, awayScore, status } = await req.json();

    if (!id || status === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        homeScore: homeScore !== "" ? parseInt(homeScore) : null,
        awayScore: awayScore !== "" ? parseInt(awayScore) : null,
        status,
      },
    });

    // If match is finished, calculate points for all predictions
    if (status === "FINISHED" && updatedMatch.homeScore !== null && updatedMatch.awayScore !== null) {
      const matchHome = updatedMatch.homeScore;
      const matchAway = updatedMatch.awayScore;
      const matchResult = matchHome > matchAway ? "HOME" : matchHome < matchAway ? "AWAY" : "DRAW";

      const predictions = await prisma.prediction.findMany({
        where: { matchId: id, pointsAwarded: null },
      });

      for (const p of predictions) {
        let points = 0;
        const predHome = p.predictedHomeScore;
        const predAway = p.predictedAwayScore;
        const predResult = predHome > predAway ? "HOME" : predHome < predAway ? "AWAY" : "DRAW";

        if (predHome === matchHome && predAway === matchAway) {
          points = 4;
        } else if (predResult === matchResult) {
          points = 1;
        }

        // Update prediction and user's total points
        await prisma.$transaction([
          prisma.prediction.update({
            where: { id: p.id },
            data: { pointsAwarded: points },
          }),
          prisma.user.update({
            where: { id: p.userId },
            data: { totalPoints: { increment: points } },
          }),
        ]);
      }
    }

    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
