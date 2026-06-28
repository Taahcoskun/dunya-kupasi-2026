import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/points";

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
      const predictions = await prisma.prediction.findMany({
        where: { matchId: id },
      });

      for (const p of predictions) {
        const points = calculatePoints(updatedMatch, p);
        const oldPoints = p.pointsAwarded || 0;
        const diff = points - oldPoints;

        await prisma.prediction.update({
          where: { id: p.id },
          data: { pointsAwarded: points },
        });

        if (diff !== 0) {
          await prisma.user.update({
            where: { id: p.userId },
            data: { totalPoints: { increment: diff } },
          });
        }
      }
    }

    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
