const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS:", users.map(u => ({ username: u.username, role: u.role })));
  
  const matches = await prisma.match.findMany();
  console.log("MATCH COUNT:", matches.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
