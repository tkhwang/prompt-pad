import { Injectable } from "@nestjs/common";
import type { ApiResponse } from "@prompt-pad/shared";

@Injectable()
export class AppService {
  getHealth(): ApiResponse<{ status: string }> {
    return {
      success: true,
      data: { status: "ok" },
    };
  }
}
