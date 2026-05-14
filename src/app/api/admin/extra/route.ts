import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  const isAdmin = session?.user?.name === "ADMIN" || (session?.user as any)?.role === "ADMIN";
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allExtra = await prisma.extraPrediction.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    const transformed = allExtra.map((item) => ({
      ...item,
      user: { username: item.user.username }
    }));

    return NextResponse.json(transformed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
