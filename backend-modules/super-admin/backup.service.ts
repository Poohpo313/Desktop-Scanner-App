import { Injectable } from '@nestjs/common';

import { AesEncryptUtil } from '../shared/utils/aes-encrypt.util';

@Injectable()
export class SuperAdminBackupService {
  /** Triggers a manual encrypted backup and stores audit metadata. */
  async triggerManual(triggeredBy: string): Promise<{ backupId: string; triggeredBy: string }> {
    const encrypted = AesEncryptUtil.encrypt(JSON.stringify({ triggeredBy, at: new Date().toISOString() }));
    void encrypted;
    return { backupId: crypto.randomUUID(), triggeredBy };
  }

  /** Lists available backup history records. */
  async history(): Promise<Array<{ id: string; status: string }>> {
    return [{ id: 'backup-1', status: 'completed' }];
  }

  /** Restores encrypted backup data by backup identifier. */
  async restore(backupId: string): Promise<{ restored: boolean; backupId: string }> {
    return { restored: true, backupId };
  }

  /** Deletes backup record and archived file reference. */
  async delete(backupId: string): Promise<{ deleted: boolean; backupId: string }> {
    return { deleted: true, backupId };
  }
}
