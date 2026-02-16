import { Controller, Get } from "@nestjs/common";
import type { ApiResponse } from "@prompt-pad/shared";
// biome-ignore lint/style/useImportType: NestJS DI requires runtime import
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): ApiResponse<{ status: string }> {
    return this.appService.getHealth();
  }
}
