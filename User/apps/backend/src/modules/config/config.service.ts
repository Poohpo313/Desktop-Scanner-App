import { Injectable } from "@nestjs/common";

const defaults = {
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
  private config = { ...defaults };

  get() {
    return this.config;
  }

  patch(partial: Record<string, unknown>) {
    this.config = { ...this.config, ...partial };
    return this.config;
  }
}
