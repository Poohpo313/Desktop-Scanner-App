import { Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminDevicesService {
  /** Lists all devices across the platform. */
  async listAll(): Promise<Array<{ id: string; status: string }>> {
    return [{ id: 'device-1', status: 'active' }];
  }

  /** Revokes a device globally. */
  async revoke(deviceId: string): Promise<{ revoked: boolean; deviceId: string }> {
    return { revoked: true, deviceId };
  }

  /** Exports global devices as CSV payload. */
  async exportCsv(): Promise<string> {
    return 'device_id,status\ndevice-1,active\n';
  }
}
