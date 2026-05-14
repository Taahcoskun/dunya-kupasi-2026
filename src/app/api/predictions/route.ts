import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { matchId, predictedHomeScore, predictedAwayScore } = await req.json();

    if (!matchId || predictedHomeScore === undefined || predictedAwayScore === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check lock rule: prediction locked if current time is within 10 mins of kickoff or past kickoff
    const now = new Date();
    const kickoff = new Date(match.kickoffTime);
    const diffMs = kickoff.getTime() - now.getTime();
    const diffMins = diffMs / 1000 / 60;

    if (diffMins < 10) {
      return NextResponse.json({ error: "Predictions are locked for this match (less than 10 mins to kickoff)" }, { status: 403 });
    }

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId,
          matchId,
        },
      },
      update: {
        predictedHomeScore: parseInt(predictedHomeScore),
        predictedAwayScore: parseInt(predictedAwayScore),
      },
      create: {
        userId,
        matchId,
        predictedHomeScore: parseInt(predictedHomeScore),
        predictedAwayScore: parseInt(predictedAwayScore),
      },
    });

    return NextResponse.json({ success: true, prediction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
