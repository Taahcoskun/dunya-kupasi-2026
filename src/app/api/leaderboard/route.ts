import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const usersData = await prisma.user.findMany({
      where: {
        AND: [
          { username: { not: "ADMIN" } },
          { role: { not: "ADMIN" } }
        ]
      },
      orderBy: {
        totalPoints: 'desc',
      },
      select: {
        id: true,
        username: true,
        totalPoints: true,
        predictions: {
          select: {
            pointsAwarded: true,
            match: {
              select: {
                kickoffTime: true
              }
            }
          }
        }
      },
    });

    const week1End = new Date("2026-06-18T12:00:00Z").getTime();
    const week2End = new Date("2026-06-24T12:00:00Z").getTime();

    const users = usersData.map(user => {
      let week1Points = 0;
      let week2Points = 0;
      let week3Points = 0;

      user.predictions.forEach(p => {
        if (p.pointsAwarded !== null && p.pointsAwarded !== undefined) {
          const kickoff = new Date(p.match.kickoffTime).getTime();
          if (kickoff < week1End) {
            week1Points += p.pointsAwarded;
          } else if (kickoff < week2End) {
            week2Points += p.pointsAwarded;
          } else {
            week3Points += p.pointsAwarded;
          }
        }
      });

      return {
        id: user.id,
        username: user.username,
        totalPoints: user.totalPoints,
        week1Points,
        week2Points,
        week3Points
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
