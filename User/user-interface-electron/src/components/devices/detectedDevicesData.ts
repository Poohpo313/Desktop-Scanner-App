export type DetectedDevice = {
  id: string;
  name: string;
  kind: "scanner" | "printer" | "multifunction";
  connectionType: string;
  status: "connected" | "offline";
  driver: string;
};

export function apiDeviceToDetected(device: {
  id: string;
  name: string;
  type: string;
  driver: string;
  connection?: string;
}): DetectedDevice {
  const kind =
    device.type === "multifunction"
      ? "multifunction"
      : device.type === "printer"
        ? "printer"
        : "scanner";

  return {
    id: device.id,
    name: device.name,
    kind,
    connectionType: device.connection ?? "System",
    status: device.id === "local-default-scanner" ? "offline" : "connected",
    driver: device.driver,
  };
}

export function detectedDeviceSummary(device: DetectedDevice): string {
  const kindLabel =
    device.kind === "scanner"
      ? "Scanner"
      : device.kind === "multifunction"
        ? "Multifunction"
        : "Printer";
  return `${kindLabel} • ${device.connectionType}`;
}
