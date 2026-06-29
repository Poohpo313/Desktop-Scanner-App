export type NotificationPreferenceId =
  | "device-registration"
  | "scanner-offline"
  | "device-synchronization"
  | "maintenance-reminders";

export type NotificationPreferences = Record<NotificationPreferenceId, boolean>;

export const NOTIFICATION_PREFERENCE_ITEMS: Array<{
  id: NotificationPreferenceId;
  label: string;
}> = [
  { id: "device-registration", label: "Device Registration Alerts" },
  { id: "scanner-offline", label: "Scanner Offline Alerts" },
  { id: "device-synchronization", label: "Device Synchronization Alerts" },
  { id: "maintenance-reminders", label: "Maintenance Reminders" },
];

export function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    "device-registration": true,
    "scanner-offline": true,
    "device-synchronization": true,
    "maintenance-reminders": false,
  };
}
