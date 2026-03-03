import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { InterestsService } from "./interests.service";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("interests")
export class InterestsController {
  constructor(private readonly service: InterestsService) {}

  @Post("toggle")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("USER", "ADMIN")
  toggle(@Req() req: any, @Body() body: { eventId: string }) {
    const userId = req.user.userId;
    return this.service.toggle(userId, body.eventId);
  }

  @Get("report/top")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  reportTop() {
    return this.service.reportTop();
  }
}