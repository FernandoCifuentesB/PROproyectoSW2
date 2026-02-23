import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto";

@Controller("events")
export class EventsController {
  constructor(private service: EventsService) {}

  // Público (para Next.js)
  @Get("public")
  listPublic(
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "6",
    @Query("search") search?: string,
    @Query("categoryId") categoryId?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
  ) {
    return this.service.listPublic({
      page: Number(page),
      pageSize: Number(pageSize),
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
  listAdmin() {
    return this.service.listAdmin();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}