import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import MatchClient from "./MatchClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const matchId = resolvedParams.id;
  const session = await getServerSession(authOptions);
  
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    notFound();
  }

  let prediction = null;
  if (session && session.user && (session.user as any).id) {
    prediction = await prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId: (session.user as any).id,
          matchId,
        },
      },
    });
  }

  return (
    <div className="container mx-auto p-8">
      <MatchClient 
        initialMatch={match} 
        initialPrediction={prediction} 
        isLoggedIn={!!session}
        userRole={(session?.user as any)?.role}
        userName={session?.user?.name || undefined}
      />
    </div>
  );
}
