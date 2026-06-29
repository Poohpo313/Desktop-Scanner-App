import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource
  ) {}

  async log(
    action: string,
    details: Record<string, unknown> = {},
    account?: { userId?: number; adminId?: number }
  ) {
    await this.db.query(
      `INSERT INTO activity_logs (user_id, admin_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        account?.userId ?? null,
        account?.adminId ?? null,
        action,
        JSON.stringify(details)
      ]
    );
  }
}
