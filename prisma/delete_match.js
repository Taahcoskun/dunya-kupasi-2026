const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { teamHome: "Türkiye", teamAway: "ABD" },
        { teamHome: "ABD", teamAway: "Türkiye" }
      ]
    }
  });

  if (match) {
    // Önce bu maça yapılmış tahminler varsa onları silelim ki hata vermesin
    await prisma.prediction.deleteMany({
      where: { matchId: match.id }
    });
    
    // Sonra maçı silelim
    await prisma.match.delete({
      where: { id: match.id }
    });
    console.log("Türkiye - ABD maçı başarıyla silindi.");
  } else {
    console.log("Türkiye - ABD maçı bulunamadı.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
