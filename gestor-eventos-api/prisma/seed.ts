import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.interest.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();

  const conciertos = await prisma.category.create({
    data: { name: "Conciertos", description: "Música en vivo" },
  });
  const deporte = await prisma.category.create({
    data: { name: "Deporte", description: "Eventos deportivos" },
  });

  const now = new Date();

  const ev1 = await prisma.event.create({
    data: {
      name: "Festival Rock",
      description: "Una noche de rock con varias bandas.",
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      price: 50000,
      imageUrl: "https://picsum.photos/seed/rock/800/450",
      categoryId: conciertos.id,
    },
  });

  const ev2 = await prisma.event.create({
    data: {
      name: "Carrera 10K",
      description: "Corre con tu combo, incluye hidratación.",
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      price: 30000,
      imageUrl: "https://picsum.photos/seed/run/800/450",
      categoryId: deporte.id,
    },
  });

  // Intereses fake
  await prisma.interest.createMany({
    data: [
      { userId: "user-1", eventId: ev1.id },
      { userId: "user-2", eventId: ev1.id },
      { userId: "user-3", eventId: ev2.id },
    ],
  });

  console.log("Seed listo ✅");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });