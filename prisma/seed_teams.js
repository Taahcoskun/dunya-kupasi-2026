const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = [
    { name: "Group A", teams: ["Mexico", "South Africa", "South Korea", "Czechia"] },
    { name: "Group B", teams: ["Canada", "Bosnia-Herzegovina", "Qatar", "Switzerland"] },
    { name: "Group C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
    { name: "Group D", teams: ["USA", "Paraguay", "Turkey", "Australia"] },
    { name: "Group E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
    { name: "Group F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
    { name: "Group G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
    { name: "Group H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
    { name: "Group I", teams: ["France", "Senegal", "Iraq", "Norway"] },
    { name: "Group J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
    { name: "Group K", teams: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"] },
    { name: "Group L", teams: ["England", "Croatia", "Ghana", "Panama"] },
  ];

  for (const group of groups) {
    for (const teamName of group.teams) {
      await prisma.team.upsert({
        where: { name: teamName },
        update: { group: group.name },
        create: {
          name: teamName,
          group: group.name,
          played: 0,
          goalDiff: 0,
          points: 0
        }
      });
    }
  }

  console.log("Seeded all 48 teams into the database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
