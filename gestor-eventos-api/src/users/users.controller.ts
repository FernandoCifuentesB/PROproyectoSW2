import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get("report")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  getUsersReport() {
    return this.service.getUsersReport();
  }
}