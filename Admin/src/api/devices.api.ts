import type { Device } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";

export type RegisterDevicePayload = {
  deviceName: string;
  deviceType: string;
  serialNumber: string;
  assignedUser: number;
};

export const devicesApi = {
  list: () => api.get<Device[]>("/devices").then((r) => unwrapList(r.data)),

  register: (payload: RegisterDevicePayload) =>
    api.post<Device>("/devices/register", payload).then((r) => r.data),

  flagInactive: (deviceId: number) =>
    api.post<Device>(`/devices/${deviceId}/flag-inactive`).then((r) => r.data),
};
