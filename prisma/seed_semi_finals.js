const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // 14 Temmuz Salı 22.00 TSİ -> UTC is 19:00
    { teamHome: "Fransa", teamAway: "İspanya", kickoffTime: new Date("2026-07-14T19:00:00Z") },

    // 15 Temmuz Çarşamba 22.00 TSİ -> UTC is 19:00
    { teamHome: "İngiltere", teamAway: "Arjantin", kickoffTime: new Date("2026-07-15T19:00:00Z") }
  ];

  console.log("Seeding Semi-Finals matches...");
  
  for (const m of matches) {
    const exists = await prisma.match.findFirst({
      where: { 
        teamHome: m.teamHome, 
        teamAway: m.teamAway
      }
    });

    if (!exists) {
      const created = await prisma.match.create({ data: m });
      console.log(`Added match: ${created.teamHome} vs ${created.teamAway} on ${created.kickoffTime}`);
    } else {
      console.log(`Match already exists: ${m.teamHome} vs ${m.teamAway}`);
    }
  }

  console.log("Semi-Finals matches seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
