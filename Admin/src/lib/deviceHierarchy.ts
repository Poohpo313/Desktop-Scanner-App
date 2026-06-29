export const UNAUTHORIZED_DEVICE_NOTE = "Unauthorized Device";

export type DeviceHierarchyFields = {
  deviceId: number;
  isPrimary?: boolean | null;
  parentDeviceId?: number | null;
  parentDeviceName?: string | null;
  warningNote?: string | null;
};

export function isUnauthorizedSecondaryDevice(device: {
  status?: string | null;
  warningNote?: string | null;
  parentDeviceId?: number | null;
}) {
  return (
    device.warningNote === UNAUTHORIZED_DEVICE_NOTE ||
    (device.status === "unauthorized" && device.parentDeviceId != null)
  );
}

export function orderDevicesForHierarchy<T extends DeviceHierarchyFields>(devices: T[]): T[] {
  const primaries = devices.filter((device) => device.isPrimary || !device.parentDeviceId);
  const childrenByParent = new Map<number, T[]>();

  for (const device of devices) {
    if (device.parentDeviceId) {
      const bucket = childrenByParent.get(device.parentDeviceId) ?? [];
      bucket.push(device);
      childrenByParent.set(device.parentDeviceId, bucket);
    }
  }

  const ordered: T[] = [];
  const seen = new Set<number>();

  for (const primary of primaries) {
    if (seen.has(primary.deviceId)) continue;
    ordered.push(primary);
    seen.add(primary.deviceId);

    for (const child of childrenByParent.get(primary.deviceId) ?? []) {
      if (seen.has(child.deviceId)) continue;
      ordered.push(child);
      seen.add(child.deviceId);
    }
  }

  for (const device of devices) {
    if (!seen.has(device.deviceId)) {
      ordered.push(device);
    }
  }

  return ordered;
}
