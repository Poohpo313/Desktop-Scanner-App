import { PORTAL, portalUserDetailPath } from "./portalPaths";

/** Legacy Figma design routes → production portal routes. */
export const ADMIN_FIGMA_REDIRECTS: Record<string, string> = {
  "/": PORTAL.splash,
  "/admin-splash": PORTAL.splash,
  "/admin-login": PORTAL.login,
  "/admin-recover-access": PORTAL.recoverAccess,
  "/admin-email-recovery-confirmation": PORTAL.recoverEmailConfirmation,
  "/admin-sms-recovery-confirmation": PORTAL.recoverSmsConfirmation,
  "/admin-dashboard": PORTAL.dashboard,
  "/admin-dashboard-2226-1193": PORTAL.dashboard,
  "/admin-dashboard-generate-keys": PORTAL.dashboard,
  "/admin-dashboard-user-register-modal": PORTAL.users,
  "/admin-dashboard-view-devices": PORTAL.devices,
  "/admin-dashboard-provide-assistance": PORTAL.help,
  "/admin-dashboard-investigate-security": PORTAL.notifications,
  "/admin-dashboard-activity-logs": PORTAL.activityLogs,
  "/admin-dashboard-notifications-center": PORTAL.notifications,
  "/success-modal-canvas": PORTAL.recoverAccess,
  "/contact-customer-modal": PORTAL.help,
  "/help-and-support-center": PORTAL.help,
  "/help-and-support-center-2212-5437": PORTAL.help,
  "/help-and-support-center-2226-2276": PORTAL.help,
  "/escalate-to-super-admin-modal": PORTAL.notifications,
  "/mark-as-resolved-modal": PORTAL.help,
  "/provide-assistance-modal": PORTAL.help,
  "/check-device-status-modal": PORTAL.devices,
  "/notify-super-admin-modal": PORTAL.notifications,
  "/monitor-device-modal": PORTAL.devices,
  "/retry-connection-modal": PORTAL.devices,
  "/report-issue-modal": PORTAL.help,
  "/license-key-management": PORTAL.keys,
  "/license-key-management-2226-2536": PORTAL.keys,
  "/revoke-key-modal": PORTAL.keys,
  "/deactivate-key-modal": PORTAL.keys,
  "/view-license-modal": PORTAL.keys,
  "/generate-keys-modal": PORTAL.keys,
  "/user-management": PORTAL.users,
  "/user-management-2212-10573": PORTAL.users,
  "/user-management-2226-1953": PORTAL.users,
  "/user-management-user-register-modal": PORTAL.users,
  "/user-management-edit-user-modal": PORTAL.users,
  "/provision-device": PORTAL.provisionDevice,
  "/device-management": PORTAL.devices,
  "/settings": PORTAL.settings,
};

export function resolveAdminFigmaRedirect(pathname: string): string | null {
  if (pathname.startsWith("/user-management-user-details/")) {
    const userId = pathname.split("/").pop();
    return userId ? portalUserDetailPath(userId) : PORTAL.users;
  }

  return ADMIN_FIGMA_REDIRECTS[pathname] ?? null;
}
