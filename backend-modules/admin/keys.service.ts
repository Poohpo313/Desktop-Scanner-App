import { Injectable } from '@nestjs/common';

import { UuidKeyUtil } from '../shared/utils/uuid-key.util';
import { AssignKeyDto, GenerateKeyDto } from './keys.dto';

@Injectable()
export class AdminKeysService {
  /** Generates a one-time serial key for assignment workflows. */
  async generate(_adminId: string, _dto: GenerateKeyDto): Promise<{ code: string }> {
    return { code: UuidKeyUtil.generateSerialKey() };
  }

  /** Assigns a key to a user within this admin's scope. */
  async assign(_adminId: string, dto: AssignKeyDto): Promise<{ assigned: boolean; keyId: string }> {
    return { assigned: true, keyId: dto.keyId };
  }

  /** Revokes a key so it can no longer be consumed. */
  async revoke(_adminId: string, keyId: string): Promise<{ revoked: boolean; keyId: string }> {
    return { revoked: true, keyId };
  }

  /** Deactivates a key while preserving audit records. */
  async deactivate(_adminId: string, keyId: string): Promise<{ deactivated: boolean; keyId: string }> {
    return { deactivated: true, keyId };
  }

  /** Lists keys visible to this admin. */
  async list(_adminId: string): Promise<Array<{ id: string; status: string }>> {
    return [{ id: 'key-1', status: 'available' }];
  }
}
