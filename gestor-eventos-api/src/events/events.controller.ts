import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";

import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

const uploadDir = join(process.cwd(), "uploads", "events");
type UploadedImage = { filename: string; mimetype: string; originalname: string };

function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
}

function eventImageStorage() {
  ensureUploadDir();

  return diskStorage({
    destination: uploadDir,
    filename: (_req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `event-${uniqueSuffix}${extname(file.originalname) || ".jpg"}`);
    },
  });
}

@Controller("events")
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get("public/top-sold")
  getTopSoldPublicEvents() {
    return this.service.getTopSoldPublicEvents();
  }

  @Get("public/:id")
  async findPublicOne(@Param("id") id: string) {
    const event = await this.service.get(id);

    if (!event || !event.isActive) {
      throw new NotFoundException("Evento no encontrado o inactivo");
    }

    return event;
  }

  @Get("public")
  listPublic(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("pageSize", new DefaultValuePipe(6), ParseIntPipe) pageSize: number,
    @Query("search") search?: string,
    @Query("categoryId") categoryId?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
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
  @UseInterceptors(
    FileInterceptor("image", {
      storage: eventImageStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        callback(null, file.mimetype.startsWith("image/"));
      },
    }),
  )
  create(@Body() dto: CreateEventDto, @UploadedFile() image?: UploadedImage) {
    return this.service.create(dto, image);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: eventImageStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        callback(null, file.mimetype.startsWith("image/"));
      },
    }),
  )
  update(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @UploadedFile() image?: UploadedImage,
  ) {
    return this.service.update(id, dto, image);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
