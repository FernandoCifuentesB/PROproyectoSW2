"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TicketTypesService = class TicketTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.ticketType.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const ticketType = await this.prisma.ticketType.findUnique({
            where: { id },
        });
        if (!ticketType) {
            throw new common_1.NotFoundException('Tipo de entrada no encontrado');
        }
        return ticketType;
    }
    async create(dto) {
        const existing = await this.prisma.ticketType.findUnique({
            where: { name: dto.name.trim() },
        });
        if (existing) {
            throw new common_1.BadRequestException('Ya existe un tipo de entrada con ese nombre');
        }
        return this.prisma.ticketType.create({
            data: {
                name: dto.name.trim(),
                description: dto.description?.trim(),
                isActive: dto.isActive ?? true,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.name) {
            const existing = await this.prisma.ticketType.findFirst({
                where: {
                    name: dto.name.trim(),
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('Ya existe un tipo de entrada con ese nombre');
            }
        }
        return this.prisma.ticketType.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
                ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        const linked = await this.prisma.eventTicket.count({
            where: { ticketTypeId: id },
        });
        if (linked > 0) {
            throw new common_1.BadRequestException('No se puede eliminar el tipo de entrada porque ya está asociado a eventos');
        }
        return this.prisma.ticketType.delete({
            where: { id },
        });
    }
};
exports.TicketTypesService = TicketTypesService;
exports.TicketTypesService = TicketTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketTypesService);
//# sourceMappingURL=ticket-types.service.js.map