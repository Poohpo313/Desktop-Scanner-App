/**
 * Cloud sync is only available when the app is online and connected to the gateway API.
 */
export function hasCloudAccess(isOnline: boolean, gatewayReachable: boolean | null): boolean {
  return isOnline && gatewayReachable === true;
}

export function effectiveCloudSync(
  cloudSync: boolean,
  isOnline: boolean,
  gatewayReachable: boolean | null,
): boolean {
  return cloudSync && hasCloudAccess(isOnline, gatewayReachable);
}

export function cloudSyncStatusLabel(
  cloudSync: boolean,
  isOnline: boolean,
  gatewayReachable: boolean | null,
): string {
  if (!hasCloudAccess(isOnline, gatewayReachable)) {
    return "Not available";
  }
  return effectiveCloudSync(cloudSync, isOnline, gatewayReachable) ? "On" : "Off";
}
