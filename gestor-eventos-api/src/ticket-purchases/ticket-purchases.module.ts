import { Module } from '@nestjs/common';
import { TicketPurchasesController } from './ticket-purchases.controller';
import { TicketPurchasesService } from './ticket-purchases.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketPurchasesController],
  providers: [TicketPurchasesService],
})
export class TicketPurchasesModule {}