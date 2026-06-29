"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceService = void 0;
const db_service_1 = require("./db.service");
const api_service_1 = require("./api.service");
const device_presence_service_1 = require("./device-presence.service");
const workstation_util_1 = require("./workstation.util");
exports.deviceService = {
    async registerLocal(data) {
        const existing = await (0, db_service_1.queryOne)("SELECT device_id FROM devices WHERE serial_number = $1", [data.serialNumber]);
        if (existing) {
            await (0, db_service_1.query)(`UPDATE devices
         SET device_name = $1, device_type = $2, assigned_user = $3, status = 'active', last_seen = NOW()
         WHERE serial_number = $4`, [data.deviceName, data.deviceType, data.assignedUser, data.serialNumber]);
            return { deviceId: existing.device_id, serialNumber: data.serialNumber };
        }
        const rows = await (0, db_service_1.query)(`INSERT INTO devices (device_name, device_type, serial_number, assigned_user, status, last_seen)
       VALUES ($1, $2, $3, $4, 'active', NOW())
       RETURNING device_id`, [data.deviceName, data.deviceType, data.serialNumber, data.assignedUser]);
        return { deviceId: rows[0]?.device_id, serialNumber: data.serialNumber };
    },
    async registerForUser(data) {
        const local = await this.registerLocal(data);
        await (0, api_service_1.registerDeviceOnline)({
            deviceName: data.deviceName,
            deviceType: data.deviceType,
            serialNumber: data.serialNumber,
            assignedUser: data.assignedUser,
            username: data.username,
        });
        device_presence_service_1.devicePresenceService.start(data.assignedUser);
        return local;
    },
    async syncClientDevicesForUser(assignedUser, username) {
        const normalizedUsername = username.trim();
        if (!assignedUser || !normalizedUsername)
            return { registered: 0 };
        let registered = 0;
        const workstation = (0, workstation_util_1.getWorkstationIdentity)();
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
