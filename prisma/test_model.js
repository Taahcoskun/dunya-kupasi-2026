const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking ExtraPrediction model...");
  try {
    const count = await prisma.extraPrediction.count();
    console.log("ExtraPrediction count:", count);
  } catch (e) {
    console.error("Error accessing ExtraPrediction model:", e.message);
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
