import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

const DEFAULTS = {
  sessionTimeoutMinutes: 10,
  maxFailedLoginAttempts: 5,
  maxDevicesPerUser: 3,
  cloudStorageGb: 100,
  backupRetentionDays: 30,
  language: "en",
  timezone: "Asia/Manila",
  scannerDefaults: {
    dpi: 300,
    colorMode: "Auto",
    pageSize: "A4"
  },
  policies: {
    userSessionMinutes: 15,
    adminSessionMinutes: 15,
    superAdminSessionMinutes: 5
  }
};

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource
  ) {}

  private async readKey(key: string) {
    const rows = (await this.db.query(
      `SELECT config_value FROM system_config WHERE config_key = $1`,
      [key]
    )) as Array<{ config_value: Record<string, unknown> }>;
    return rows[0]?.config_value ?? null;
  }

  async get() {
    const stored = await this.readKey("app");
    return { ...DEFAULTS, ...(stored ?? {}) };
  }

  async patch(partial: Record<string, unknown>) {
    const current = await this.get();
    const merged = { ...current, ...partial };
    await this.db.query(
      `INSERT INTO system_config (config_key, config_value, updated_at)
       VALUES ('app', $1, NOW())
       ON CONFLICT (config_key)
       DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = NOW()`,
      [JSON.stringify(merged)]
    );
    return merged;
  }
}
