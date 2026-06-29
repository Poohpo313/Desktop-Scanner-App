import { Injectable } from '@nestjs/common';

import { UuidKeyUtil } from '../shared/utils/uuid-key.util';
import { AssignToAdminDto, BulkGenerateDto } from './keys.dto';

@Injectable()
export class SuperAdminKeysService {
  /** Generates key batches for admin distribution. */
  async bulkGenerate(dto: BulkGenerateDto): Promise<string[]> {
    return Array.from({ length: dto.count }, () => UuidKeyUtil.generateSerialKey());
  }

  /** Assigns a generated key to an admin for downstream distribution. */
  async assignToAdmin(dto: AssignToAdminDto): Promise<{ assigned: boolean; keyId: string; adminId: string }> {
    return { assigned: true, keyId: dto.keyId, adminId: dto.adminId };
  }

  /** Returns global key usage history. */
  async history(): Promise<Array<{ id: string; status: string }>> {
    return [{ id: 'key-1', status: 'used' }];
  }
}
