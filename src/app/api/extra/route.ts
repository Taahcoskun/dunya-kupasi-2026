import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// First match kickoff: June 11, 2026, 22:00 TR (19:00 UTC)
const LOCK_TIME = new Date("2026-06-11T19:00:00Z");

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const results = await prisma.extraPrediction.findUnique({
      where: { userId }
    });
    return NextResponse.json(results || {});
  } catch (e: any) {
     return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  if (now >= LOCK_TIME) {
    return NextResponse.json({ error: "Extra predictions are locked as the tournament has started." }, { status: 403 });
  }

  try {
    const { winnerTeam, leastConcededTeam, mostConcededTeam, topScorer, topAssister } = await req.json();
    const userId = (session.user as any).id;
    const updatedAt = new Date().toISOString();

    if (!userId) {
       return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const existing = await prisma.extraPrediction.findUnique({
      where: { userId }
    });

    if (existing) {
      await prisma.extraPrediction.update({
        where: { userId },
        data: { winnerTeam, leastConcededTeam, mostConcededTeam, topScorer, topAssister, updatedAt: new Date() }
      });
    } else {
      await prisma.extraPrediction.create({
        data: { userId, winnerTeam, leastConcededTeam, mostConcededTeam, topScorer, topAssister, updatedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("RAW ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
