import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params;
  const session = await getServerSession(authOptions);
  
  const isAdmin = session?.user?.name === "ADMIN" || (session?.user as any)?.role === "ADMIN";
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const teamHome = searchParams.get("teamHome");
  const teamAway = searchParams.get("teamAway");

  const allPredictions = await prisma.prediction.findMany({
    where: {
      OR: [
        { matchId: matchId },
        {
          match: {
            teamHome: teamHome || "NON_EXISTENT",
            teamAway: teamAway || "NON_EXISTENT"
          }
        }
      ]
    },
    include: {
      user: {
        select: {
          username: true
        }
      }
    }
  });

  return NextResponse.json(allPredictions);
}
