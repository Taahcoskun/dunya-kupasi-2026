import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Prevent caching so we get live data

export async function GET(req: Request) {
  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        kickoffTime: 'asc',
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
