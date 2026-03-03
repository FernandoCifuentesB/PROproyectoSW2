import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Param } from "@nestjs/common";
import { InterestsService } from "./interests.service";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("interests")
export class InterestsController {
  constructor(private readonly service: InterestsService) { }

  // USER/ADMIN: marcar o quitar interés
  @Post("toggle")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("USER", "ADMIN")
  toggle(@Req() req: any, @Body() body: { eventId: string }) {
    const userId = req.user.userId;
    return this.service.toggle(userId, body.eventId);
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("USER", "ADMIN")
  myFavorites(@Req() req: any) {
    const userId = req.user.userId;
    return this.service.myFavorites(userId);
  }

  @Get("report/by-event")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  reportByEvent() {
    return this.service.reportByEvent();
  }

  @Get("report/top")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  reportTop() {
    return this.service.reportTop();
  }

  @Get("event/:eventId")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  getUsersByEvent(@Param("eventId") eventId: string) {
    return this.service.getUsersByEvent(eventId);
  }
}