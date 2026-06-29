import { disconnectDeviceOnline, heartbeatDevice } from "./api.service";
import { getWorkstationIdentity } from "./workstation.util";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let activeUserId: number | null = null;
let activeSerialNumber: string | null = null;
let stopping = false;

export const devicePresenceService = {
  isStopping() {
    return stopping;
  },

  start(userId: number) {
    if (!userId) return;
    stopping = false;

    const workstation = getWorkstationIdentity();
    activeUserId = userId;
    activeSerialNumber = workstation.serialNumber;

    void heartbeatDevice(workstation.serialNumber, userId);

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }

    heartbeatTimer = setInterval(() => {
      if (!activeSerialNumber || activeUserId == null) return;
      void heartbeatDevice(activeSerialNumber, activeUserId);
    }, HEARTBEAT_INTERVAL_MS);
  },

  async stop() {
    if (stopping) return;
    stopping = true;

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    if (activeSerialNumber) {
      await disconnectDeviceOnline(activeSerialNumber, activeUserId ?? undefined);
    }

    activeUserId = null;
    activeSerialNumber = null;
  },
};
