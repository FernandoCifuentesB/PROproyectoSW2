import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventTicketsService } from './event-tickets.service';
import { CreateEventTicketDto } from './dto/create-event-ticket.dto';
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class EventTicketsController {
  constructor(private readonly eventTicketsService: EventTicketsService) {}

  @Get('events/:eventId/tickets')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findByEvent(@Param('eventId') eventId: string) {
    return this.eventTicketsService.findByEvent(eventId);
  }

  @Get('events/public/:eventId/tickets')
  findAvailableByEvent(@Param('eventId') eventId: string) {
    return this.eventTicketsService.findAvailableByEvent(eventId);
  }

  @Post('events/:eventId/tickets')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateEventTicketDto,
  ) {
    return this.eventTicketsService.create(eventId, dto);
  }

  @Patch('events/:eventId/tickets/:eventTicketId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('eventId') eventId: string,
    @Param('eventTicketId') eventTicketId: string,
    @Body() dto: UpdateEventTicketDto,
  ) {
    return this.eventTicketsService.update(eventId, eventTicketId, dto);
  }

  @Delete('events/:eventId/tickets/:eventTicketId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(
    @Param('eventId') eventId: string,
    @Param('eventTicketId') eventTicketId: string,
  ) {
    return this.eventTicketsService.remove(eventId, eventTicketId);
  }
}