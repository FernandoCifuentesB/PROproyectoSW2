import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { EventsModule } from '@/events/events.module';
import { PaymentEventsModule } from '@/payment-events/payment-events.module';
import { TicketPurchasesController } from './ticket-purchases.controller';
import { TicketPurchasesService } from './ticket-purchases.service';

@Module({
  imports: [PrismaModule, EventsModule, PaymentEventsModule],
  controllers: [TicketPurchasesController],
  providers: [TicketPurchasesService],
})
export class TicketPurchasesModule {}