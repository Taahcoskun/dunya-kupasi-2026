const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // 4 Temmuz Cumartesi
    { teamHome: "Kanada", teamAway: "Fas", kickoffTime: new Date("2026-07-04T17:00:00Z") }, // TSİ 20:00

    // 5 Temmuz Pazar
    { teamHome: "Fransa", teamAway: "Paraguay", kickoffTime: new Date("2026-07-04T21:00:00Z") }, // TSİ 00:00
    { teamHome: "Brezilya", teamAway: "Norveç", kickoffTime: new Date("2026-07-05T20:00:00Z") }, // TSİ 23:00

    // 6 Temmuz Pazartesi
    { teamHome: "İngiltere", teamAway: "Meksika", kickoffTime: new Date("2026-07-06T00:00:00Z") }, // TSİ 03:00
    { teamHome: "Portekiz", teamAway: "İspanya", kickoffTime: new Date("2026-07-06T19:00:00Z") }, // TSİ 22:00

    // 7 Temmuz Salı
    { teamHome: "ABD", teamAway: "Belçika", kickoffTime: new Date("2026-07-07T00:00:00Z") }, // TSİ 03:00
    { teamHome: "Arjantin", teamAway: "Mısır", kickoffTime: new Date("2026-07-07T16:00:00Z") }, // TSİ 19:00
    { teamHome: "İsviçre", teamAway: "Kolombiya", kickoffTime: new Date("2026-07-07T20:00:00Z") } // TSİ 23:00
  ];

  console.log("Seeding Round of 16 matches...");
  
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

  console.log("Round of 16 matches seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
