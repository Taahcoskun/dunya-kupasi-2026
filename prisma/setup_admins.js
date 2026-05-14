const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("MEHMET123!", 10);
  
  // Upsert Mehmet
  const mehmet = await prisma.user.upsert({
    where: { username: "Mehmet" },
    update: { passwordHash, role: "ADMIN" },
    create: { username: "Mehmet", passwordHash, role: "ADMIN" }
  });
  console.log("Mehmet user ensured with admin role.");

  // Upsert admin
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordHash, role: "ADMIN" },
    create: { username: "admin", passwordHash, role: "ADMIN" }
  });
  console.log("admin user ensured with admin role.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
