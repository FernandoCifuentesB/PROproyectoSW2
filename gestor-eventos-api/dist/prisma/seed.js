"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Iniciando seed...");
    await prisma.ticketPurchase.deleteMany();
    await prisma.eventTicket.deleteMany();
    await prisma.ticketType.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.interest.deleteMany();
    await prisma.event.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
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
    const ticketTypes = [];
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
    const cat1 = await prisma.category.create({
        data: { name: "Conciertos", description: "Eventos musicales" },
    });
    const cat2 = await prisma.category.create({
        data: { name: "Tecnología", description: "Meetups tech" },
    });
    const categories = [cat1, cat2];
    console.log("📂 Categorías creadas");
    const createdEvents = [];
    for (let i = 1; i <= 10; i++) {
        const event = await prisma.event.create({
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
        createdEvents.push(event);
    }
    console.log("🎉 Eventos creados");
    function getType(name) {
        const found = ticketTypes.find((t) => t.name === name);
        if (!found)
            throw new Error(`❌ Tipo de entrada no encontrado: ${name}`);
        return found;
    }
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
//# sourceMappingURL=seed.js.map