import { Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminReportsService {
  /** Builds unscoped global summary statistics. */
  async summary(): Promise<{ users: number; admins: number; documents: number }> {
    return { users: 0, admins: 0, documents: 0 };
  }

  /** Exports full-platform report in CSV format. */
  async exportCsv(): Promise<string> {
    return 'metric,value\nusers,0\nadmins,0\ndocuments,0\n';
  }
}
