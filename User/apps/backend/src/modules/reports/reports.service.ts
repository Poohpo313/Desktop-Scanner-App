import { Injectable } from "@nestjs/common";

@Injectable()
export class ReportsService {
  summary() {
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      activeKeys: 0,
      usedKeys: 0,
      revokedKeys: 0,
      registeredDevices: 0,
      activeDevices: 0,
      recentActivity: [] as { action: string; timestamp: string; userId?: number }[],
      keyUsage: [
        { name: "unused", value: 0 },
        { name: "used", value: 0 },
        { name: "revoked", value: 0 },
        { name: "assigned", value: 0 }
      ],
      filesPerDay: [
        { day: "Mon", count: 0 },
        { day: "Tue", count: 0 },
        { day: "Wed", count: 0 },
        { day: "Thu", count: 0 },
        { day: "Fri", count: 0 },
        { day: "Sat", count: 0 },
        { day: "Sun", count: 0 }
      ]
    };
  }

  exportCsv(type: string) {
    return { type, rows: [] };
  }
}
