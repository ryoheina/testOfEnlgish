import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-data";

async function main() {
  console.log("Seeding database...");
  const prisma = new PrismaClient();
  try {
    await seedDatabase(prisma);
    console.log("Seeding complete!");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
