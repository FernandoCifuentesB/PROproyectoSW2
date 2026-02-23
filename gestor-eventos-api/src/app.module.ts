import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CategoriesModule } from "./categories/categories.module";
import { EventsModule } from "./events/events.module";
import { InterestsModule } from "./interests/interests.module";

@Module({
  imports: [PrismaModule, CategoriesModule, EventsModule, InterestsModule],
})
export class AppModule {}