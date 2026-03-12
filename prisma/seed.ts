import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the admin password
  const hashedPassword = await bcrypt.hash("ali@0039", 10);

  // Create or update the admin user
  const admin = await prisma.user.upsert({
    where: { username: "alibinnadeem" },
    update: {},
    create: {
      username: "alibinnadeem",
      password: hashedPassword,
      role: "Admin",
      isApproved: true,
    },
  });

  console.log("Admin user created/updated:", admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
