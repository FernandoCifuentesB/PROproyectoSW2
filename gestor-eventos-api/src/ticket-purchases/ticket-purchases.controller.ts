import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { TicketPurchasesService } from './ticket-purchases.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';
import { Roles } from '@/auth/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';

type AuthRequest = Request & {
  user: {
    userId: string;
    role: 'ADMIN' | 'USER';
  };
};

@Controller('ticket-purchases')
@UseGuards(AuthGuard('jwt'))
export class TicketPurchasesController {
  constructor(
    private readonly ticketPurchasesService: TicketPurchasesService,
  ) {}

  // ✅ Crear compra
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateTicketPurchaseDto) {
    return this.ticketPurchasesService.create(req.user.userId, dto);
  }

  // 🔥 NUEVO: Reporte por evento (ADMIN)
  @Get('report/event/:eventId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getEventReport(@Param('eventId') eventId: string) {
    return this.ticketPurchasesService.getEventSalesReport(eventId);
  }

  // ✅ Resumen admin (ya lo tenías)
  @Get('admin/summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getAdminSummary() {
    return this.ticketPurchasesService.getAdminSummary();
  }

  // ✅ Mis compras
  @Get('me')
  findMine(@Req() req: AuthRequest) {
    return this.ticketPurchasesService.findMine(req.user.userId);
  }

  // ✅ Obtener compra por id
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.ticketPurchasesService.findOne(id, req.user.userId);
  }
}