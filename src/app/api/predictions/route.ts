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
    const { 
      matchId, 
      predictedHomeScore, 
      predictedAwayScore,
      predictedHomeExtraScore,
      predictedAwayExtraScore,
      penaltyWinner
    } = await req.json();

    if (!matchId || predictedHomeScore === undefined || predictedAwayScore === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check lock rule: prediction locked if current time is past kickoff (match started)
    const now = new Date();
    const kickoff = new Date(match.kickoffTime);

    if (now >= kickoff) {
      return NextResponse.json({ error: "Predictions are locked for this match (match has started)" }, { status: 403 });
    }

    // Validation for knockout matches (Round of 32 starting on June 28)
    const isKnockout = kickoff >= new Date("2026-06-28T10:00:00Z");
    
    let parsedHomeExtra: number | null = null;
    let parsedAwayExtra: number | null = null;
    let finalPenaltyWinner: string | null = null;

    if (isKnockout) {
      const pHome = parseInt(predictedHomeScore);
      const pAway = parseInt(predictedAwayScore);
      
      if (pHome === pAway) {
        if (predictedHomeExtraScore !== undefined && predictedAwayExtraScore !== undefined && predictedHomeExtraScore !== null && predictedAwayExtraScore !== null) {
          parsedHomeExtra = parseInt(predictedHomeExtraScore);
          parsedAwayExtra = parseInt(predictedAwayExtraScore);
          
          if (parsedHomeExtra === parsedAwayExtra) {
            if (penaltyWinner && (penaltyWinner === match.teamHome || penaltyWinner === match.teamAway)) {
              finalPenaltyWinner = penaltyWinner;
            } else {
              return NextResponse.json({ error: "Lütfen penaltı kazananını seçin." }, { status: 400 });
            }
          }
        } else {
          return NextResponse.json({ error: "Lütfen uzatma süresi tahminlerini girin." }, { status: 400 });
        }
      }
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
        predictedHomeExtraScore: parsedHomeExtra,
        predictedAwayExtraScore: parsedAwayExtra,
        penaltyWinner: finalPenaltyWinner,
      },
      create: {
        userId,
        matchId,
        predictedHomeScore: parseInt(predictedHomeScore),
        predictedAwayScore: parseInt(predictedAwayScore),
        predictedHomeExtraScore: parsedHomeExtra,
        predictedAwayExtraScore: parsedAwayExtra,
        penaltyWinner: finalPenaltyWinner,
      },
    });

    return NextResponse.json({ success: true, prediction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
