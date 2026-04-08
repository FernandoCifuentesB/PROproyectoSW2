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
exports.TicketPurchasesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const ticket_purchases_service_1 = require("./ticket-purchases.service");
const create_ticket_purchase_dto_1 = require("./dto/create-ticket-purchase.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let TicketPurchasesController = class TicketPurchasesController {
    ticketPurchasesService;
    constructor(ticketPurchasesService) {
        this.ticketPurchasesService = ticketPurchasesService;
    }
    create(req, dto) {
        return this.ticketPurchasesService.create(req.user.userId, dto);
    }
    getAdminSummary() {
        return this.ticketPurchasesService.getAdminSummary();
    }
    findMine(req) {
        return this.ticketPurchasesService.findMine(req.user.userId);
    }
    findOne(id, req) {
        return this.ticketPurchasesService.findOne(id, req.user.userId);
    }
};
exports.TicketPurchasesController = TicketPurchasesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_ticket_purchase_dto_1.CreateTicketPurchaseDto]),
    __metadata("design:returntype", void 0)
], TicketPurchasesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin/summary'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketPurchasesController.prototype, "getAdminSummary", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TicketPurchasesController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TicketPurchasesController.prototype, "findOne", null);
exports.TicketPurchasesController = TicketPurchasesController = __decorate([
    (0, common_1.Controller)('ticket-purchases'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [ticket_purchases_service_1.TicketPurchasesService])
], TicketPurchasesController);
//# sourceMappingURL=ticket-purchases.controller.js.map