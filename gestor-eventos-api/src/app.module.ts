import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CategoriesModule } from "./categories/categories.module";
import { EventsModule } from "./events/events.module";
import { InterestsModule } from "./interests/interests.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TicketTypesModule } from '@/ticket-types/ticket-types.module';
import { EventTicketsModule } from '@/event-tickets/event-tickets.module';
import { TicketPurchasesModule } from '@/ticket-purchases/ticket-purchases.module';
import { ConfigModule } from "@nestjs/config/dist/config.module";

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }), AuthModule, PrismaModule, CategoriesModule, EventsModule, InterestsModule, UsersModule, TicketTypesModule,
    EventTicketsModule,
    TicketPurchasesModule,],
})
export class AppModule { }