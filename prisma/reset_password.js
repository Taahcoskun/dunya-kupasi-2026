const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("MEHMET123!", 10);
  
  const user = await prisma.user.updateMany({
    where: { username: "Mehmet" },
    data: { passwordHash }
  });

  if (user.count > 0) {
    console.log("Mehmet's password has been reset to: MEHMET123!");
  } else {
    // Maybe the username is lowercase
    const userLower = await prisma.user.updateMany({
      where: { username: "mehmet" },
      data: { passwordHash }
    });
    if (userLower.count > 0) {
      console.log("mehmet's password has been reset to: MEHMET123!");
    } else {
      console.log("User 'Mehmet' not found.");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
