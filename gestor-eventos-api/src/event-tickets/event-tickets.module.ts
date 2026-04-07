import { Module } from '@nestjs/common';
import { EventTicketsController } from './event-tickets.controller';
import { EventTicketsService } from './event-tickets.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventTicketsController],
  providers: [EventTicketsService],
  exports: [EventTicketsService],
})
export class EventTicketsModule {}