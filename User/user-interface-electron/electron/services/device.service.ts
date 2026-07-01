import { query, queryOne } from "./db.service";
import { registerDeviceOnline } from "./api.service";
import { devicePresenceService } from "./device-presence.service";
import { getWorkstationIdentity } from "./workstation.util";

export const deviceService = {
  async registerLocal(data: {
    deviceName: string;
    deviceType: string;
    serialNumber: string;
    assignedUser: number;
  }) {
    const existing = await queryOne<{ device_id: number }>(
      "SELECT device_id FROM devices WHERE serial_number = $1",
      [data.serialNumber],
    );

    if (existing) {
      await query(
        `UPDATE devices
         SET device_name = $1, device_type = $2, assigned_user = $3, status = 'active', last_seen = NOW()
         WHERE serial_number = $4`,
        [data.deviceName, data.deviceType, data.assignedUser, data.serialNumber],
      );
      return { deviceId: existing.device_id, serialNumber: data.serialNumber };
    }

    const rows = await query<{ device_id: number }>(
      `INSERT INTO devices (device_name, device_type, serial_number, assigned_user, status, last_seen)
       VALUES ($1, $2, $3, $4, 'active', NOW())
       RETURNING device_id`,
      [data.deviceName, data.deviceType, data.serialNumber, data.assignedUser],
    );

    return { deviceId: rows[0]?.device_id, serialNumber: data.serialNumber };
  },

  async registerForUser(data: {
    deviceName: string;
    deviceType: string;
    serialNumber: string;
    assignedUser: number;
    username?: string;
  }) {
    const local = await this.registerLocal(data);
    const online = await registerDeviceOnline({
      deviceName: data.deviceName,
      deviceType: data.deviceType,
      serialNumber: data.serialNumber,
      assignedUser: data.assignedUser,
      username: data.username,
    });
    if (online.success) {
      devicePresenceService.start(data.assignedUser);
    }
    return { ...local, onlineRegistered: online.success };
  },

  async syncClientDevicesForUser(assignedUser: number, username: string) {
    const normalizedUsername = username.trim();
    if (!assignedUser || !normalizedUsername) return { registered: 0 };

    let registered = 0;

    const workstation = getWorkstationIdentity();
    await this.registerForUser({
      deviceName: workstation.deviceName,
      deviceType: "workstation",
      serialNumber: workstation.serialNumber,
      assignedUser,
      username: normalizedUsername,
    });
    registered += 1;

    return { registered };
  },
};
