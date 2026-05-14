const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { teamHome: 'Meksika', teamAway: 'Güney Afrika' },
        { teamHome: 'Güney Kore', teamAway: 'Çekya' }
      ]
    }
  });

  console.log("Bulunan maçlar:", matches.map(m => `${m.teamHome} vs ${m.teamAway}`));

  for (const match of matches) {
    // Find predictions with awarded points
    const predictions = await prisma.prediction.findMany({
      where: { matchId: match.id, pointsAwarded: { not: null } }
    });

    console.log(`${match.teamHome} vs ${match.teamAway} için ${predictions.length} tahmin sıfırlanıyor...`);

    for (const p of predictions) {
      if (p.pointsAwarded > 0) {
        await prisma.user.update({
          where: { id: p.userId },
          data: { totalPoints: { decrement: p.pointsAwarded } }
        });
      }
      await prisma.prediction.update({
        where: { id: p.id },
        data: { pointsAwarded: null }
      });
    }

    // Reset match
    await prisma.match.update({
      where: { id: match.id },
      data: {
        homeScore: null,
        awayScore: null,
        status: 'SCHEDULED'
      }
    });
    console.log(`Maç sıfırlandı: ${match.teamHome} vs ${match.teamAway}`);
  }
  
  console.log("İşlem tamamlandı.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
