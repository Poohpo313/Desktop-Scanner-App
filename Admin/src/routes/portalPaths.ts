export const PORTAL = {
  splash: "/portal/splash",
  login: "/portal/login",
  dashboard: "/portal/dashboard",
  users: "/portal/users",
  keys: "/portal/keys",
  devices: "/portal/devices",
  provisionDevice: "/portal/devices/provision",
  reports: "/portal/reports",
  activityLogs: "/portal/activity-logs",
  notifications: "/portal/notifications",
  help: "/portal/help",
  settings: "/portal/settings",
  recoverAccess: "/portal/recover-access",
  recoverEmailConfirmation: "/portal/recover-access/email",
  recoverSmsConfirmation: "/portal/recover-access/sms",
} as const;

export function portalUserDetailPath(userId: number | string) {
  return `${PORTAL.users}/${userId}`;
}
