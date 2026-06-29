import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminDevicesService {
  /** Lists devices linked to users scoped under this admin. */
  async list(_adminId: string): Promise<Array<{ id: string; status: string }>> {
    return [{ id: 'device-1', status: 'active' }];
  }

  /** Flags an inactive device and marks it for super-admin attention. */
  async flagInactive(_adminId: string, deviceId: string): Promise<{ flagged: boolean; deviceId: string }> {
    return { flagged: true, deviceId };
  }
}
