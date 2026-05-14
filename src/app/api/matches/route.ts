import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const matches = await prisma.match.findMany({
      orderBy: {
        kickoffTime: 'asc',
      },
      include: userId ? {
        predictions: {
          where: { userId },
          select: {
            predictedHomeScore: true,
            predictedAwayScore: true,
            pointsAwarded: true,
          }
        }
      } : undefined
    });

    // Flatten prediction into match object for easier frontend use
    const matchesWithPrediction = matches.map(m => {
      const { predictions, ...matchData } = m as any;
      return {
        ...matchData,
        userPrediction: predictions?.[0] || null
      };
    });

    return NextResponse.json(matchesWithPrediction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
