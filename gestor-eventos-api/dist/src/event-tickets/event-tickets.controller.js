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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTicketsController = void 0;
const common_1 = require("@nestjs/common");
const event_tickets_service_1 = require("./event-tickets.service");
const create_event_ticket_dto_1 = require("./dto/create-event-ticket.dto");
const update_event_ticket_dto_1 = require("./dto/update-event-ticket.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let EventTicketsController = class EventTicketsController {
    eventTicketsService;
    constructor(eventTicketsService) {
        this.eventTicketsService = eventTicketsService;
    }
    findByEvent(eventId) {
        return this.eventTicketsService.findByEvent(eventId);
    }
    findAvailableByEvent(eventId) {
        return this.eventTicketsService.findAvailableByEvent(eventId);
    }
    create(eventId, dto) {
        return this.eventTicketsService.create(eventId, dto);
    }
    update(eventId, eventTicketId, dto) {
        return this.eventTicketsService.update(eventId, eventTicketId, dto);
    }
    remove(eventId, eventTicketId) {
        return this.eventTicketsService.remove(eventId, eventTicketId);
    }
};
exports.EventTicketsController = EventTicketsController;
__decorate([
    (0, common_1.Get)('events/:eventId/tickets'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventTicketsController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)('events/public/:eventId/tickets'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventTicketsController.prototype, "findAvailableByEvent", null);
__decorate([
    (0, common_1.Post)('events/:eventId/tickets'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_ticket_dto_1.CreateEventTicketDto]),
    __metadata("design:returntype", void 0)
], EventTicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('events/:eventId/tickets/:eventTicketId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('eventTicketId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_event_ticket_dto_1.UpdateEventTicketDto]),
    __metadata("design:returntype", void 0)
], EventTicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('events/:eventId/tickets/:eventTicketId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('eventTicketId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventTicketsController.prototype, "remove", null);
exports.EventTicketsController = EventTicketsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [event_tickets_service_1.EventTicketsService])
], EventTicketsController);
//# sourceMappingURL=event-tickets.controller.js.map