export type DeviceDeleteReasonId =
  | "unauthorized-device"
  | "inactive-device"
  | "compromised-device"
  | "data-privacy-request"
  | "others";

export type DeviceDeleteReason = {
  id: DeviceDeleteReasonId;
  label: string;
  description?: string;
};

export const DEVICE_DELETE_REASONS: DeviceDeleteReason[] = [
  {
    id: "unauthorized-device",
    label: "Unauthorized device",
    description: "Device does not meet system requirements or policy",
  },
  {
    id: "inactive-device",
    label: "Inactive device",
    description: "Device hasn't connected or synced for a defined period",
  },
  {
    id: "compromised-device",
    label: "Compromised device",
    description: "Device shows signs of malware, tampering, or breach attempts",
  },
  {
    id: "data-privacy-request",
    label: "Data privacy request",
  },
  {
    id: "others",
    label: "Others",
  },
];
