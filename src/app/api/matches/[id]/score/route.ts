import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = await params;
  const session = await getServerSession(authOptions);
  const logPath = path.join(process.cwd(), "debug_admin.log");

  try {
    const body = await req.json();
    const { homeScore, awayScore, status, teamHome, teamAway } = body;

    const isAdmin = session?.user?.name === "ADMIN" || (session?.user as any)?.role === "ADMIN";

    if (!isAdmin) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hScore = parseInt(homeScore.toString()) || 0;
    const aScore = parseInt(awayScore.toString()) || 0;

    // First, try update by ID
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { homeScore: hScore, awayScore: aScore, status: status }
    }).catch(() => null);

    let updateResult = match ? 1 : 0;

    // If ID update failed (0 rows), try fallback by Team Names
    if (updateResult === 0 && teamHome && teamAway) {
      const fallbackMatch = await prisma.match.findFirst({
        where: { teamHome, teamAway }
      });
      if (fallbackMatch) {
        await prisma.match.update({
          where: { id: fallbackMatch.id },
          data: { homeScore: hScore, awayScore: aScore, status: status }
        });
        updateResult = 1;
      }
    }

    if (updateResult === 0) {
       fs.appendFileSync(logPath, `FAILED TO UPDATE ID: ${matchId}\n`);
    }

    const dbMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { teamHome, teamAway },
          { id: matchId }
        ]
      }
    });

    const dbMatchId = dbMatch?.id || matchId;

    if (status === "FINISHED") {
      const predictions = await prisma.prediction.findMany({
        where: {
          OR: [
            { matchId: dbMatchId },
            {
              match: {
                teamHome: teamHome || "NON_EXISTENT",
                teamAway: teamAway || "NON_EXISTENT"
              }
            }
          ]
        }
      });

      for (const pred of predictions) {
        let points = 0;
        const predHome = pred.predictedHomeScore;
        const predAway = pred.predictedAwayScore;
        const isResultCorrect = (hScore > aScore && predHome > predAway) || (hScore < aScore && predHome < predAway) || (hScore === aScore && predHome === predAway);
        
        if (isResultCorrect) {
          points = 1;
          if (hScore === predHome && aScore === predAway) points = 4;
        }
        
        const oldPoints = pred.pointsAwarded || 0;
        const diff = points - oldPoints;
        
        await prisma.prediction.update({
          where: { id: pred.id },
          data: { pointsAwarded: points }
        });
        
        if (diff !== 0) {
          await prisma.user.update({
            where: { id: pred.userId },
            data: { totalPoints: { increment: diff } }
          });
        }
      }
    }

    revalidatePath("/");
    revalidatePath(`/match/${matchId}`);

    return NextResponse.json({ success: true, rowsAffected: updateResult });
  } catch (error: any) {
    fs.appendFileSync(logPath, `ERROR: ${error.message}\n`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
