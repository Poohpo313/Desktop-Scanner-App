import {
  disconnectDeviceOnline,
  heartbeatDevice,
  registerDeviceOnline,
} from "./api.service";
import { getWorkstationIdentity } from "./workstation.util";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let activeUserId: number | null = null;
let activeSerialNumber: string | null = null;
let stopping = false;

async function sendHeartbeat() {
  if (!activeSerialNumber || activeUserId == null) return;

  const result = await heartbeatDevice(activeSerialNumber, activeUserId);
  if (result.success || !result.needsRegister) return;

  const workstation = getWorkstationIdentity();
  const registered = await registerDeviceOnline({
    deviceName: workstation.deviceName,
    deviceType: "workstation",
    serialNumber: workstation.serialNumber,
    assignedUser: activeUserId,
  });
  if (registered.success) {
    await heartbeatDevice(activeSerialNumber, activeUserId);
  }
}

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

    void sendHeartbeat();

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }

    heartbeatTimer = setInterval(() => {
      void sendHeartbeat();
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
