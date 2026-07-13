const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPoints() {
  const users = await prisma.user.findMany({
    include: { predictions: true }
  });
  let mismatchCount = 0;
  for (const user of users) {
    const correctPoints = user.predictions.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);
    if (user.totalPoints !== correctPoints) {
      console.log(`User ${user.username} (ID: ${user.id}): DB totalPoints=${user.totalPoints}, Calculated=${correctPoints}`);
      mismatchCount++;
      await prisma.user.update({ where: { id: user.id }, data: { totalPoints: correctPoints } });
    }
  }
  console.log(`Total mismatches: ${mismatchCount}. Fixed them.`);
  await prisma.$disconnect();
}
checkPoints();
