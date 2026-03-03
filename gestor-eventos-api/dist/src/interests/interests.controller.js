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
exports.InterestsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const common_2 = require("@nestjs/common");
const interests_service_1 = require("./interests.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let InterestsController = class InterestsController {
    service;
    constructor(service) {
        this.service = service;
    }
    toggle(req, body) {
        const userId = req.user.userId;
        return this.service.toggle(userId, body.eventId);
    }
    myFavorites(req) {
        const userId = req.user.userId;
        return this.service.myFavorites(userId);
    }
    reportByEvent() {
        return this.service.reportByEvent();
    }
    reportTop() {
        return this.service.reportTop();
    }
    getUsersByEvent(eventId) {
        return this.service.getUsersByEvent(eventId);
    }
};
exports.InterestsController = InterestsController;
__decorate([
    (0, common_1.Post)("toggle"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("USER", "ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("USER", "ADMIN"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "myFavorites", null);
__decorate([
    (0, common_1.Get)("report/by-event"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "reportByEvent", null);
__decorate([
    (0, common_1.Get)("report/top"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "reportTop", null);
__decorate([
    (0, common_1.Get)("event/:eventId"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    __param(0, (0, common_2.Param)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "getUsersByEvent", null);
exports.InterestsController = InterestsController = __decorate([
    (0, common_1.Controller)("interests"),
    __metadata("design:paramtypes", [interests_service_1.InterestsService])
], InterestsController);
//# sourceMappingURL=interests.controller.js.map