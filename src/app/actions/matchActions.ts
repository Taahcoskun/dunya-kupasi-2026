"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateMatchScoreAction(matchId: string, homeScore: number, awayScore: number, status: string, teamHome: string, teamAway: string) {
  const session = await getServerSession(authOptions);
  
  const isAdmin = session?.user?.name?.toUpperCase() === "ADMIN" || (session?.user as any)?.role === "ADMIN";

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Update Match (Try ID first, then Team Names fallback)
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status }
    }).catch(() => null);

    let updateResult = match ? 1 : 0;

    if (updateResult === 0 && teamHome && teamAway) {
      const fallbackMatch = await prisma.match.findFirst({
        where: { teamHome, teamAway }
      });
      if (fallbackMatch) {
        await prisma.match.update({
          where: { id: fallbackMatch.id },
          data: { homeScore, awayScore, status }
        });
        updateResult = 1;
      }
    }

    // 2. Points Calculation (if FINISHED)
    if (status === "FINISHED") {
      // Find the actual DB ID
      const dbMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { teamHome, teamAway },
            { id: matchId }
          ]
        }
      });
      const actualId = dbMatch?.id || matchId;

      const predictions = await prisma.prediction.findMany({
        where: {
          OR: [
            { matchId: actualId },
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
        
        // Correct Result (Win/Loss/Draw) -> 1 Point
        const isResultCorrect = (homeScore > awayScore && predHome > predAway) || 
                               (homeScore < awayScore && predHome < predAway) || 
                               (homeScore === awayScore && predHome === predAway);
        
        if (isResultCorrect) {
          points = 1;
          // Exact Score -> +3 More Points (Total 4)
          if (homeScore === predHome && awayScore === predAway) {
            points = 4;
          }
        }

        const oldPoints = pred.pointsAwarded || 0;
        const diff = points - oldPoints;

        // Update individual prediction points
        await prisma.prediction.update({
          where: { id: pred.id },
          data: { pointsAwarded: points }
        });
        
        // Update user's total points by the difference
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
    return { success: true };
  } catch (error: any) {
    console.error("SERVER ACTION ERROR:", error);
    return { success: false, error: error.message };
  }
}

export async function resetMatchAction(matchId: string, teamHome: string, teamAway: string) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.name?.toUpperCase() === "ADMIN" || (session?.user as any)?.role === "ADMIN";

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    const dbMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { id: matchId },
          { teamHome, teamAway }
        ]
      }
    });

    if (!dbMatch) return { success: false, error: "Match not found" };

    const predictions = await prisma.prediction.findMany({
      where: { matchId: dbMatch.id, pointsAwarded: { not: null } }
    });

    for (const pred of predictions) {
      if (pred.pointsAwarded && pred.pointsAwarded > 0) {
        await prisma.user.update({
          where: { id: pred.userId },
          data: { totalPoints: { decrement: pred.pointsAwarded } }
        });
      }
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { pointsAwarded: null }
      });
    }

    await prisma.match.update({
      where: { id: dbMatch.id },
      data: { homeScore: null, awayScore: null, status: "SCHEDULED" }
    });

    revalidatePath("/");
    revalidatePath(`/match/${matchId}`);
    return { success: true };
  } catch (error: any) {
    console.error("RESET MATCH ACTION ERROR:", error);
    return { success: false, error: error.message };
  }
}
