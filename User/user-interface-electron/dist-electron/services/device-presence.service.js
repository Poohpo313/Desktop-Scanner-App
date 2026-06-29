"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devicePresenceService = void 0;
const api_service_1 = require("./api.service");
const workstation_util_1 = require("./workstation.util");
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
let heartbeatTimer = null;
let activeUserId = null;
let activeSerialNumber = null;
let stopping = false;
exports.devicePresenceService = {
    isStopping() {
        return stopping;
    },
    start(userId) {
        if (!userId)
            return;
        stopping = false;
        const workstation = (0, workstation_util_1.getWorkstationIdentity)();
        activeUserId = userId;
        activeSerialNumber = workstation.serialNumber;
        void (0, api_service_1.heartbeatDevice)(workstation.serialNumber, userId);
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
        }
        heartbeatTimer = setInterval(() => {
            if (!activeSerialNumber || activeUserId == null)
                return;
            void (0, api_service_1.heartbeatDevice)(activeSerialNumber, activeUserId);
        }, HEARTBEAT_INTERVAL_MS);
    },
    async stop() {
        if (stopping)
            return;
        stopping = true;
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        if (activeSerialNumber) {
            await (0, api_service_1.disconnectDeviceOnline)(activeSerialNumber);
        }
        activeUserId = null;
        activeSerialNumber = null;
    },
};
