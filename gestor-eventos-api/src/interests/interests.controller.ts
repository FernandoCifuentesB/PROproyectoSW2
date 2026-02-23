import { Body, Controller, Get, Post } from "@nestjs/common";
import { InterestsService } from "./interests.service";
import { ToggleInterestDto } from "./dto";

@Controller("interests")
export class InterestsController {
  constructor(private service: InterestsService) {}

  @Post("toggle")
  toggle(@Body() dto: ToggleInterestDto) {
    return this.service.toggle(dto);
  }

  @Get("report/top")
  reportTop() {
    return this.service.reportTop();
  }
}