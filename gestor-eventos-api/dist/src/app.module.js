"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const categories_module_1 = require("./categories/categories.module");
const events_module_1 = require("./events/events.module");
const interests_module_1 = require("./interests/interests.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const ticket_types_module_1 = require("./ticket-types/ticket-types.module");
const event_tickets_module_1 = require("./event-tickets/event-tickets.module");
const ticket_purchases_module_1 = require("./ticket-purchases/ticket-purchases.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: ".env",
                isGlobal: true,
            }),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 60 * 5,
                max: 100,
            }),
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            categories_module_1.CategoriesModule,
            events_module_1.EventsModule,
            interests_module_1.InterestsModule,
            users_module_1.UsersModule,
            ticket_types_module_1.TicketTypesModule,
            event_tickets_module_1.EventTicketsModule,
            ticket_purchases_module_1.TicketPurchasesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map