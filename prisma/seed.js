const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleared.');

  // Create matches
  const now = new Date();
  
  // Past match
  const pastTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
  
  // Live match
  const liveTime = new Date(now.getTime() - 45 * 60 * 1000); // 45 minutes ago

  // Upcoming matches
  const upcomingSoon = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
  const upcomingLate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

  const matches = [
    {
      teamHome: 'USA',
      teamAway: 'Mexico',
      kickoffTime: pastTime,
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED',
    },
    {
      teamHome: 'Brazil',
      teamAway: 'Argentina',
      kickoffTime: liveTime,
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
    },
    {
      teamHome: 'France',
      teamAway: 'Germany',
      kickoffTime: upcomingSoon,
      status: 'SCHEDULED',
    },
    {
      teamHome: 'Spain',
      teamAway: 'Portugal',
      kickoffTime: upcomingLate,
      status: 'SCHEDULED',
    },
    {
      teamHome: 'England',
      teamAway: 'Italy',
      kickoffTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
      status: 'SCHEDULED',
    }
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: m,
    });
  }

  console.log('Matches seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
