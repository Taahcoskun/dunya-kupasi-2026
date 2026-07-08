const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // 9 Temmuz Perşembe
    { teamHome: "Fransa", teamAway: "Fas", kickoffTime: new Date("2026-07-09T20:00:00Z") }, // TSİ 23:00

    // 10 Temmuz Cuma
    { teamHome: "İspanya", teamAway: "Belçika", kickoffTime: new Date("2026-07-10T19:00:00Z") }, // TSİ 22:00

    // 12 Temmuz Pazar
    { teamHome: "Norveç", teamAway: "İngiltere", kickoffTime: new Date("2026-07-11T21:00:00Z") }, // TSİ 00:00 (11 Temmuz'u 12 Temmuz'a bağlayan gece)
    { teamHome: "Arjantin", teamAway: "İsviçre", kickoffTime: new Date("2026-07-12T01:00:00Z") }  // TSİ 04:00 (12 Temmuz sabaha karşı)
  ];

  console.log("Seeding Quarter-Finals matches...");
  
  for (const m of matches) {
    const exists = await prisma.match.findFirst({
      where: { 
        teamHome: m.teamHome, 
        teamAway: m.teamAway, 
        kickoffTime: m.kickoffTime 
      }
    });

    if (!exists) {
      const created = await prisma.match.create({ data: m });
      console.log(`Added match: ${created.teamHome} vs ${created.teamAway} on ${created.kickoffTime}`);
    } else {
      console.log(`Match already exists: ${m.teamHome} vs ${m.teamAway}`);
    }
  }

  console.log("Quarter-Finals matches seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
