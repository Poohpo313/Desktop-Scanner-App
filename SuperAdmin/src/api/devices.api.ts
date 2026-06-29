import type { Device } from "../types";
import api from "./axios";
import { unwrapList } from "./listResponse";

export const devicesApi = {
  list: () => api.get<Device[]>("/devices").then((r) => unwrapList(r.data)),

  recycleBin: () => api.get<Device[]>("/devices/recycle-bin").then((r) => unwrapList(r.data)),

  restore: (deviceId: number) =>
    api.patch<Device>(`/devices/${deviceId}/restore`).then((r) => r.data),

  revoke: (deviceId: number) =>
    api.delete<Device>(`/devices/${deviceId}/revoke`).then((r) => r.data),

  permanentDelete: (deviceId: number) =>
    api.delete<{ success: boolean }>(`/devices/${deviceId}/permanent`).then((r) => r.data),

  exportCsv: async () => {
    const devices = await devicesApi.list();
    const headers = ["deviceId", "deviceName", "serialNumber", "status", "lastSeen"];
    const csv = [
      headers.join(","),
      ...devices.map((d) =>
        headers.map((h) => JSON.stringify(d[h as keyof Device] ?? "")).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devices-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  },
};
