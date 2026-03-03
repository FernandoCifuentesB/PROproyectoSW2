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
const interests_service_1 = require("./interests.service");
const dto_1 = require("./dto");
let InterestsController = class InterestsController {
    service;
    constructor(service) {
        this.service = service;
    }
    toggle(dto) {
        return this.service.toggle(dto);
    }
    reportTop() {
        return this.service.reportTop();
    }
};
exports.InterestsController = InterestsController;
__decorate([
    (0, common_1.Post)("toggle"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ToggleInterestDto]),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)("report/top"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InterestsController.prototype, "reportTop", null);
exports.InterestsController = InterestsController = __decorate([
    (0, common_1.Controller)("interests"),
    __metadata("design:paramtypes", [interests_service_1.InterestsService])
], InterestsController);
//# sourceMappingURL=interests.controller.js.map