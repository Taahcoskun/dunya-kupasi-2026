const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // 28 Haziran Pazar
    { teamHome: "Güney Afrika", teamAway: "Kanada", kickoffTime: new Date("2026-06-28T19:00:00Z") },

    // 29 Haziran Pazartesi
    { teamHome: "Brezilya", teamAway: "Japonya", kickoffTime: new Date("2026-06-29T17:00:00Z") },
    { teamHome: "Almanya", teamAway: "Paraguay", kickoffTime: new Date("2026-06-29T20:30:00Z") },

    // 30 Haziran Salı
    { teamHome: "Hollanda", teamAway: "Fas", kickoffTime: new Date("2026-06-30T01:00:00Z") },
    { teamHome: "Fildişi Sahili", teamAway: "Norveç", kickoffTime: new Date("2026-06-30T17:00:00Z") },

    // 1 Temmuz Çarşamba
    { teamHome: "Fransa", teamAway: "İsveç", kickoffTime: new Date("2026-06-30T21:00:00Z") }, // TSİ 00.00
    { teamHome: "Meksika", teamAway: "Ekvador", kickoffTime: new Date("2026-07-01T01:00:00Z") }, // TSİ 04.00
    { teamHome: "İngiltere", teamAway: "Kongo DC", kickoffTime: new Date("2026-07-01T16:00:00Z") }, // TSİ 19.00
    { teamHome: "Belçika", teamAway: "Senegal", kickoffTime: new Date("2026-07-01T20:00:00Z") }, // TSİ 23.00

    // 2 Temmuz Perşembe
    { teamHome: "ABD", teamAway: "Bosna-Hersek", kickoffTime: new Date("2026-07-02T00:00:00Z") }, // TSİ 03.00
    { teamHome: "İspanya", teamAway: "Avusturya", kickoffTime: new Date("2026-07-02T19:00:00Z") }, // TSİ 22.00

    // 3 Temmuz Cuma
    { teamHome: "Portekiz", teamAway: "Hırvatistan", kickoffTime: new Date("2026-07-02T23:00:00Z") }, // TSİ 02.00
    { teamHome: "İsviçre", teamAway: "Cezayir", kickoffTime: new Date("2026-07-03T03:00:00Z") }, // TSİ 06.00
    { teamHome: "Avustralya", teamAway: "Mısır", kickoffTime: new Date("2026-07-03T18:00:00Z") }, // TSİ 21.00

    // 4 Temmuz Cumartesi
    { teamHome: "Arjantin", teamAway: "Yeşil Burun Adaları", kickoffTime: new Date("2026-07-03T22:00:00Z") }, // TSİ 01.00
    { teamHome: "Kolombiya", teamAway: "Gana", kickoffTime: new Date("2026-07-04T01:30:00Z") } // TSİ 04.30
  ];

  console.log("Seeding Round of 32 matches...");
  
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

  console.log("Round of 32 matches seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
