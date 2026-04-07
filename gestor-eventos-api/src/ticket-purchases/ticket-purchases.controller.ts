import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TicketPurchasesService } from "./ticket-purchases.service";
import { CreateTicketPurchaseDto } from "./dto/create-ticket-purchase.dto";

@Controller("ticket-purchases")
@UseGuards(AuthGuard("jwt"))
export class TicketPurchasesController {
  constructor(
    private readonly ticketPurchasesService: TicketPurchasesService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTicketPurchaseDto) {
    return this.ticketPurchasesService.create(req.user.userId, dto);
  }

  @Get("me")
  findMine(@Req() req: any) {
    return this.ticketPurchasesService.findMine(req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.ticketPurchasesService.findOne(id, req.user.userId);
  }
}