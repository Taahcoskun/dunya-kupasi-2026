const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const username = "ADMIN";
  const password = "ADMIN123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      role: "ADMIN"
    },
    create: {
      username,
      passwordHash,
      role: "ADMIN"
    }
  });

  console.log(`Admin user created/updated: ${admin.username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
