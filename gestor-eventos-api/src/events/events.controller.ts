import {
  Body,
  Controller,
  Delete,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("events")
export class EventsController {
  constructor(private service: EventsService) {}

  
  @Get("public")
  listPublic(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("pageSize", new DefaultValuePipe(6), ParseIntPipe) pageSize: number,
    @Query("search") search?: string,
    @Query("categoryId") categoryId?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string
  ) {
    return this.service.listPublic({
      page,
      pageSize,
      search,
      categoryId,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      fromDate,
      toDate,
    });
  }

  // Admin
  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  listAdmin() {
    return this.service.listAdmin();
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}