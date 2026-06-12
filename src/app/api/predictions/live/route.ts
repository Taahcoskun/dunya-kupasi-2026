import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Fetch all matches
    const matches = await prisma.match.findMany({
      orderBy: { kickoffTime: "asc" }
    });

    // Filter matches that are locked (match has started)
    const lockedMatches = matches.filter(match => {
      const kickoff = new Date(match.kickoffTime);
      return now >= kickoff;
    });

    const lockedMatchIds = lockedMatches.map(m => m.id);

    // Fetch predictions for locked matches
    const predictions = await prisma.prediction.findMany({
      where: {
        matchId: { in: lockedMatchIds }
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        user: {
          username: "asc"
        }
      }
    });

    // Group predictions by matchId
    const predictionsByMatch: Record<string, any[]> = {};
    predictions.forEach(p => {
      if (!predictionsByMatch[p.matchId]) {
        predictionsByMatch[p.matchId] = [];
      }
      predictionsByMatch[p.matchId].push({
        id: p.id,
        username: p.user.username,
        predictedHomeScore: p.predictedHomeScore,
        predictedAwayScore: p.predictedAwayScore,
        pointsAwarded: p.pointsAwarded
      });
    });

    // Map matches with their predictions
    const result = lockedMatches.map(match => ({
      id: match.id,
      teamHome: match.teamHome,
      teamAway: match.teamAway,
      kickoffTime: match.kickoffTime,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      predictions: predictionsByMatch[match.id] || []
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Live predictions API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
