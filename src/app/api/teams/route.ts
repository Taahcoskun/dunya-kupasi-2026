import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const teams = await prisma.team.findMany({
    orderBy: [
      { group: "asc" },
      { points: "desc" },
      { goalDiff: "desc" }
    ]
  });
  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any)?.role !== "ADMIN" && session.user?.name !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, played, goalDiff, points } = await req.json();

    const team = await prisma.team.update({
      where: { id },
      data: {
        played: parseInt(played),
        goalDiff: parseInt(goalDiff),
        points: parseInt(points),
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
