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
    const userId = req?.user?.userId;

    if (!userId) {
      // Si cae aquí, el front no está enviando Authorization Bearer
      // o JWT_SECRET/strategy no están funcionando.
      throw new Error("No llegó req.user.userId (token inválido o JWT strategy no aplicada)");
    }

    if (!body?.eventId) {
      throw new Error("Falta eventId en el body");
    }

    return this.service.toggle(userId, body.eventId);
  }

  @Get("report/top")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  reportTop() {
    return this.service.reportTop();
  }
}