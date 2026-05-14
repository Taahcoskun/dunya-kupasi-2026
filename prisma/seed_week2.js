const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // Week 2 Screenshots Transcription (UTC = TR - 3h)
    { teamHome: "Czechia", teamAway: "South Africa", kickoffTime: new Date("2026-06-18T16:00:00Z") },
    { teamHome: "Switzerland", teamAway: "Bosnia-Herzegovina", kickoffTime: new Date("2026-06-18T19:00:00Z") },
    { teamHome: "Canada", teamAway: "Qatar", kickoffTime: new Date("2026-06-18T22:00:00Z") },
    { teamHome: "Mexico", teamAway: "South Korea", kickoffTime: new Date("2026-06-19T01:00:00Z") },
    { teamHome: "USA", teamAway: "Australia", kickoffTime: new Date("2026-06-19T19:00:00Z") },
    { teamHome: "Scotland", teamAway: "Morocco", kickoffTime: new Date("2026-06-19T22:00:00Z") },
    { teamHome: "Brazil", teamAway: "Haiti", kickoffTime: new Date("2026-06-20T00:30:00Z") },
    { teamHome: "Turkey", teamAway: "Paraguay", kickoffTime: new Date("2026-06-20T03:00:00Z") },
    { teamHome: "Netherlands", teamAway: "Sweden", kickoffTime: new Date("2026-06-20T17:00:00Z") },
    { teamHome: "Germany", teamAway: "Ivory Coast", kickoffTime: new Date("2026-06-20T20:00:00Z") },
    { teamHome: "Ecuador", teamAway: "Curacao", kickoffTime: new Date("2026-06-21T00:00:00Z") },
    { teamHome: "Tunisia", teamAway: "Japan", kickoffTime: new Date("2026-06-21T04:00:00Z") },
    { teamHome: "Spain", teamAway: "Saudi Arabia", kickoffTime: new Date("2026-06-21T16:00:00Z") },
    { teamHome: "Belgium", teamAway: "Iran", kickoffTime: new Date("2026-06-21T19:00:00Z") },
    { teamHome: "Uruguay", teamAway: "Cape Verde", kickoffTime: new Date("2026-06-21T22:00:00Z") },
    { teamHome: "New Zealand", teamAway: "Egypt", kickoffTime: new Date("2026-06-22T01:00:00Z") },
    { teamHome: "Argentina", teamAway: "Austria", kickoffTime: new Date("2026-06-22T17:00:00Z") },
    { teamHome: "France", teamAway: "Iraq", kickoffTime: new Date("2026-06-22T21:00:00Z") },
    { teamHome: "Norway", teamAway: "Senegal", kickoffTime: new Date("2026-06-23T00:00:00Z") },
    { teamHome: "Jordan", teamAway: "Algeria", kickoffTime: new Date("2026-06-23T03:00:00Z") },
    { teamHome: "Portugal", teamAway: "Uzbekistan", kickoffTime: new Date("2026-06-23T17:00:00Z") },
    { teamHome: "England", teamAway: "Ghana", kickoffTime: new Date("2026-06-23T20:00:00Z") },
    { teamHome: "Panama", teamAway: "Croatia", kickoffTime: new Date("2026-06-23T23:00:00Z") },
    { teamHome: "Colombia", teamAway: "DR Congo", kickoffTime: new Date("2026-06-24T02:00:00Z") }
  ];

  for (const m of matches) {
    const exists = await prisma.match.findFirst({
      where: { teamHome: m.teamHome, teamAway: m.teamAway, kickoffTime: m.kickoffTime }
    });
    if (!exists) {
      await prisma.match.create({ data: m });
      console.log(`Added Week 2 match: ${m.teamHome} vs ${m.teamAway}`);
    }
  }

  console.log("Seeded all Week 2 matches.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
