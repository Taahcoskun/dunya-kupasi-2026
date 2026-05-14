const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = [
    // Week 3 Screenshots Transcription (UTC = TR - 3h)
    { teamHome: "Bosnia-Herzegovina", teamAway: "Qatar", kickoffTime: new Date("2026-06-24T19:00:00Z") },
    { teamHome: "Switzerland", teamAway: "Canada", kickoffTime: new Date("2026-06-24T19:00:00Z") },
    { teamHome: "Morocco", teamAway: "Haiti", kickoffTime: new Date("2026-06-24T22:00:00Z") },
    { teamHome: "Scotland", teamAway: "Brazil", kickoffTime: new Date("2026-06-24T22:00:00Z") },
    { teamHome: "Czechia", teamAway: "Mexico", kickoffTime: new Date("2026-06-25T01:00:00Z") },
    { teamHome: "South Africa", teamAway: "South Korea", kickoffTime: new Date("2026-06-25T01:00:00Z") },
    { teamHome: "Curacao", teamAway: "Ivory Coast", kickoffTime: new Date("2026-06-25T20:00:00Z") },
    { teamHome: "Ecuador", teamAway: "Germany", kickoffTime: new Date("2026-06-25T20:00:00Z") },
    { teamHome: "Japan", teamAway: "Sweden", kickoffTime: new Date("2026-06-25T23:00:00Z") },
    { teamHome: "Tunisia", teamAway: "Netherlands", kickoffTime: new Date("2026-06-25T23:00:00Z") },
    { teamHome: "Paraguay", teamAway: "Australia", kickoffTime: new Date("2026-06-26T02:00:00Z") },
    { teamHome: "Turkey", teamAway: "USA", kickoffTime: new Date("2026-06-26T02:00:00Z") },
    { teamHome: "Norway", teamAway: "France", kickoffTime: new Date("2026-06-26T19:00:00Z") },
    { teamHome: "Senegal", teamAway: "Iraq", kickoffTime: new Date("2026-06-26T19:00:00Z") },
    { teamHome: "Cape Verde", teamAway: "Saudi Arabia", kickoffTime: new Date("2026-06-27T00:00:00Z") },
    { teamHome: "Uruguay", teamAway: "Spain", kickoffTime: new Date("2026-06-27T00:00:00Z") },
    { teamHome: "Egypt", teamAway: "Iran", kickoffTime: new Date("2026-06-27T03:00:00Z") },
    { teamHome: "New Zealand", teamAway: "Belgium", kickoffTime: new Date("2026-06-27T03:00:00Z") },
    { teamHome: "Croatia", teamAway: "Ghana", kickoffTime: new Date("2026-06-27T21:00:00Z") },
    { teamHome: "Panama", teamAway: "England", kickoffTime: new Date("2026-06-27T21:00:00Z") },
    { teamHome: "Colombia", teamAway: "Portugal", kickoffTime: new Date("2026-06-27T23:30:00Z") },
    { teamHome: "DR Congo", teamAway: "Uzbekistan", kickoffTime: new Date("2026-06-27T23:30:00Z") },
    { teamHome: "Algeria", teamAway: "Austria", kickoffTime: new Date("2026-06-28T02:00:00Z") },
    { teamHome: "Jordan", teamAway: "Argentina", kickoffTime: new Date("2026-06-28T02:00:00Z") }
  ];

  for (const m of matches) {
    const exists = await prisma.match.findFirst({
      where: { teamHome: m.teamHome, teamAway: m.teamAway, kickoffTime: m.kickoffTime }
    });
    if (!exists) {
      await prisma.match.create({ data: m });
      console.log(`Added Week 3 match: ${m.teamHome} vs ${m.teamAway}`);
    }
  }

  console.log("Seeded all Week 3 matches.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
