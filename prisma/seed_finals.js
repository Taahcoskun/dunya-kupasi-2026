const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // 19 Temmuz Pazar 00:00 TSİ -> UTC is 21:00 on July 18
    { teamHome: "Fransa", teamAway: "İngiltere", kickoffTime: new Date("2026-07-18T21:00:00Z") },

    // 19 Temmuz Pazar 22:00 TSİ -> UTC is 19:00 on July 19
    { teamHome: "İspanya", teamAway: "Arjantin", kickoffTime: new Date("2026-07-19T19:00:00Z") }
  ];

  console.log("Seeding Finals matches...");
  
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

  console.log("Finals matches seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
