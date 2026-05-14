const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Brezilya vs Almanya maçını bulalım
  const match = await prisma.match.findFirst({
    where: {
      teamHome: "Brezilya",
      teamAway: "Almanya"
    }
  });

  if (match) {
    // 14 Mayıs 2026, Türkiye saatiyle 14:00'e ayarlıyoruz.
    // Türkiye UTC+3 olduğu için veritabanına "11:00:00Z" olarak kaydedeceğiz.
    await prisma.match.update({
      where: { id: match.id },
      data: { 
        kickoffTime: new Date("2026-05-14T11:00:00Z"), 
        status: "SCHEDULED" 
      }
    });
    console.log("Brezilya vs Almanya maçının tarihi 14 Mayıs 2026, 14:00 (Türkiye Saati) olarak güncellendi.");
  } else {
    console.log("Brezilya - Almanya maçı bulunamadı!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
