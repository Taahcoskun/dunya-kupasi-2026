const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matchId = 'cmp30pxb90000a94pyj26kszr'; // Meksika - Güney Afrika
  console.log("Updating match to 2-1...");
  
  const result = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: 2,
      awayScore: 1,
      status: 'SCHEDULED'
    }
  });
  
  console.log("Update successful. New data:", result);
  
  const check = await prisma.match.findUnique({ where: { id: matchId } });
  console.log("Verification from DB:", check);
}

main().catch(console.error).finally(() => prisma.$disconnect());
