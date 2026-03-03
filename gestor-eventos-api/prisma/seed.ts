import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@demo.com",
      password: adminPass,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "User Demo",
      email: "user@demo.com",
      password: userPass,
      role: "USER",
    },
  });

  const cat1 = await prisma.category.create({
    data: { name: "Conciertos", description: "Eventos musicales" },
  });

  const cat2 = await prisma.category.create({
    data: { name: "Tecnología", description: "Meetups tech" },
  });

  const categories = [cat1, cat2];

  for (let i = 1; i <= 20; i++) {
    await prisma.event.create({
      data: {
        name: `Evento ${i}`,
        description: `Descripción del evento número ${i}.`,
        date: new Date(Date.now() + i * 86400000),
        price: i * 10000,
        imageUrl: null,
        categoryId: categories[i % 2].id,
        isActive: true,
      },
    });
  }

  console.log("ADMIN: admin@demo.com / admin123");
  console.log("USER: user@demo.com / user123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());