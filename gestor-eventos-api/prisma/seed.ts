import { PrismaClient, Event, TicketType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 🔥 Limpieza (orden correcto por FK)
  await prisma.ticketPurchase.deleteMany();
  await prisma.eventTicket.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 🔐 Usuarios
  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass = await bcrypt.hash("user123", 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@demo.com",
      password: adminPass,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "User Demo",
      email: "user@demo.com",
      password: userPass,
      role: "USER",
    },
  });

  console.log("👤 Usuarios creados");

  // 🎟️ Tipos de entrada (GLOBAL Y REUTILIZABLE)
  const ticketTypes: TicketType[] = [];

  const ticketTypeData = [
    { name: "VIP", description: "Entrada VIP" },
    { name: "Oro", description: "Entrada Oro" },
    { name: "Plata", description: "Entrada Plata" },
    { name: "Bronce", description: "Entrada Bronce" },
    { name: "General", description: "Entrada General" },
  ];

  for (const type of ticketTypeData) {
    const created = await prisma.ticketType.create({
      data: {
        ...type,
        isActive: true,
      },
    });
    ticketTypes.push(created);
  }

  console.log("🎟️ Tipos de entrada creados");

  // 📂 Categorías
  const cat1 = await prisma.category.create({
    data: { name: "Conciertos", description: "Eventos musicales" },
  });

  const cat2 = await prisma.category.create({
    data: { name: "Tecnología", description: "Meetups tech" },
  });

  const categories = [cat1, cat2];

  console.log("📂 Categorías creadas");

  // 🎉 Eventos
  const createdEvents: Event[] = [];

  for (let i = 1; i <= 10; i++) {
    const event = await prisma.event.create({
      data: {
        name: `Evento ${i}`,
        description: `Descripción del evento número ${i}.`,
        date: new Date(Date.now() + i * 86400000),
        price: i * 10000, // fallback
        imageUrl: null,
        categoryId: categories[i % 2].id,
        isActive: true,
      },
    });

    createdEvents.push(event);
  }

  console.log("🎉 Eventos creados");

  // 🔎 Helper seguro
  function getType(name: string): TicketType {
    const found = ticketTypes.find((t) => t.name === name);
    if (!found) throw new Error(`❌ Tipo de entrada no encontrado: ${name}`);
    return found;
  }

  // 🎫 Asignar entradas a eventos
  await prisma.eventTicket.createMany({
    data: [
      {
        eventId: createdEvents[0].id,
        ticketTypeId: getType("VIP").id,
        price: 200000,
        stock: 10,
        sold: 0,
        isActive: true,
      },
      {
        eventId: createdEvents[0].id,
        ticketTypeId: getType("General").id,
        price: 80000,
        stock: 100,
        sold: 0,
        isActive: true,
      },
      {
        eventId: createdEvents[1].id,
        ticketTypeId: getType("Oro").id,
        price: 150000,
        stock: 30,
        sold: 0,
        isActive: true,
      },
      {
        eventId: createdEvents[1].id,
        ticketTypeId: getType("Plata").id,
        price: 100000,
        stock: 50,
        sold: 0,
        isActive: true,
      },
      {
        eventId: createdEvents[2].id,
        ticketTypeId: getType("Bronce").id,
        price: 60000,
        stock: 80,
        sold: 0,
        isActive: true,
      },
      {
        eventId: createdEvents[2].id,
        ticketTypeId: getType("General").id,
        price: 40000,
        stock: 120,
        sold: 0,
        isActive: true,
      },
    ],
  });

  console.log("🎫 Entradas asignadas a eventos");

  console.log("✅ SEED COMPLETADO");
  console.log("ADMIN: admin@demo.com / admin123");
  console.log("USER: user@demo.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ ERROR EN SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });