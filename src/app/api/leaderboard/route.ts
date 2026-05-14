import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
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
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
