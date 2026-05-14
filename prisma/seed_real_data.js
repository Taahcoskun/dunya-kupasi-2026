const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.prediction.deleteMany({});
  await prisma.match.deleteMany({});

  const matches = [
    // Screenshots Transcription (Times adjusted from TR to UTC by subtracting 3 hours)
    { teamHome: "Mexico", teamAway: "South Africa", kickoffTime: new Date("2026-06-11T19:00:00Z") },
    { teamHome: "South Korea", teamAway: "Czechia", kickoffTime: new Date("2026-06-12T02:00:00Z") },
    { teamHome: "Canada", teamAway: "Bosnia-Herzegovina", kickoffTime: new Date("2026-06-12T19:00:00Z") },
    { teamHome: "USA", teamAway: "Paraguay", kickoffTime: new Date("2026-06-13T01:00:00Z") },
    { teamHome: "Qatar", teamAway: "Switzerland", kickoffTime: new Date("2026-06-13T19:00:00Z") },
    { teamHome: "Brazil", teamAway: "Morocco", kickoffTime: new Date("2026-06-13T22:00:00Z") },
    { teamHome: "Haiti", teamAway: "Scotland", kickoffTime: new Date("2026-06-14T01:00:00Z") },
    { teamHome: "Australia", teamAway: "Turkey", kickoffTime: new Date("2026-06-14T04:00:00Z") },
    { teamHome: "Germany", teamAway: "Curacao", kickoffTime: new Date("2026-06-14T17:00:00Z") },
    { teamHome: "Netherlands", teamAway: "Japan", kickoffTime: new Date("2026-06-14T20:00:00Z") },
    { teamHome: "Ivory Coast", teamAway: "Ecuador", kickoffTime: new Date("2026-06-14T23:00:00Z") },
    { teamHome: "Sweden", teamAway: "Tunisia", kickoffTime: new Date("2026-06-15T02:00:00Z") },
    { teamHome: "Spain", teamAway: "Cape Verde", kickoffTime: new Date("2026-06-15T15:00:00Z") },
    { teamHome: "Saudi Arabia", teamAway: "Uruguay", kickoffTime: new Date("2026-06-15T22:00:00Z") },
    { teamHome: "Iran", teamAway: "New Zealand", kickoffTime: new Date("2026-06-16T01:00:00Z") },
    { teamHome: "France", teamAway: "Senegal", kickoffTime: new Date("2026-06-16T19:00:00Z") },
    { teamHome: "Iraq", teamAway: "Norway", kickoffTime: new Date("2026-06-16T22:00:00Z") },
    { teamHome: "Argentina", teamAway: "Algeria", kickoffTime: new Date("2026-06-17T01:00:00Z") },
    { teamHome: "Austria", teamAway: "Jordan", kickoffTime: new Date("2026-06-17T04:00:00Z") },
    { teamHome: "Portugal", teamAway: "DR Congo", kickoffTime: new Date("2026-06-17T17:00:00Z") },
    { teamHome: "England", teamAway: "Croatia", kickoffTime: new Date("2026-06-17T20:00:00Z") },
    { teamHome: "Ghana", teamAway: "Panama", kickoffTime: new Date("2026-06-17T23:00:00Z") },
    { teamHome: "Uzbekistan", teamAway: "Colombia", kickoffTime: new Date("2026-06-18T02:00:00Z") },

    // Today Test Matches (May 12, 2026) for demo
    { teamHome: "Turkey", teamAway: "USA", kickoffTime: new Date("2026-05-12T18:00:00Z"), status: "LIVE", homeScore: 2, awayScore: 1 },
    { teamHome: "Brazil", teamAway: "Germany", kickoffTime: new Date("2026-05-12T21:00:00Z"), status: "SCHEDULED" }
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: {
        ...m,
        status: m.status || "SCHEDULED"
      }
    });
  }

  console.log(`Seeded ${matches.length} matches exactly from screenshots.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
