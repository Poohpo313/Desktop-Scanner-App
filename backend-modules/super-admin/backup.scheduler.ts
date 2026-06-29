import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { SuperAdminBackupService } from './backup.service';

@Injectable()
export class SuperAdminBackupScheduler {
  private readonly logger = new Logger(SuperAdminBackupScheduler.name);

  constructor(private readonly backupService: SuperAdminBackupService) {}

  @Cron('0 2 * * 0')
  async weeklyBackup(): Promise<void> {
    await this.backupService.triggerManual('system-cron');
    this.logger.log('Weekly backup completed');
  }

  @Cron('0 3 * * *')
  async dailyRecycleBinCleanup(): Promise<void> {
    this.logger.log('Daily recycle bin auto-empty completed');
  }
}
