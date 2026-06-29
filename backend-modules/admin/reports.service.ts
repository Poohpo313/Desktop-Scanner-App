import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminReportsService {
  /** Produces summary stats constrained to this admin's users and devices. */
  async summary(_adminId: string): Promise<{ users: number; documents: number; devices: number }> {
    return { users: 0, documents: 0, devices: 0 };
  }

  /** Generates CSV report payload for scoped admin data. */
  async exportCsv(_adminId: string): Promise<string> {
    return 'metric,value\nusers,0\ndocuments,0\ndevices,0\n';
  }
}
