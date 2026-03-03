import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { InterestsService } from "./interests.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("interests")
export class InterestsController {
  constructor(private readonly service: InterestsService) { }

  @Post("toggle")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("USER", "ADMIN")
  toggle(@Req() req: any, @Body() body: { eventId: string }) {
    const userId = req.user.userId;
    return this.service.toggle(userId, body.eventId);
  }
}