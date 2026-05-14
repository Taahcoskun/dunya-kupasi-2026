const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = await prisma.match.findFirst({
    where: { teamHome: "Meksika", teamAway: "Güney Afrika" }
  });
  console.log(m);
}

main().finally(() => prisma.$disconnect());
