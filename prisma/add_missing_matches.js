const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const missingMatches = [
    { teamHome: "Belgium", teamAway: "Egypt", kickoffTime: new Date("2026-06-16T19:00:00Z") } // 22:00 TR
  ];

  for (const m of missingMatches) {
    const exists = await prisma.match.findFirst({
      where: { teamHome: m.teamHome, teamAway: m.teamAway }
    });
    
    if (!exists) {
      await prisma.match.create({ data: m });
      console.log(`Added missing match: ${m.teamHome} vs ${m.teamAway}`);
    } else {
      console.log(`Match ${m.teamHome} vs ${m.teamAway} already exists.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
