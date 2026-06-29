export type LicenseKeyRevokeReasonId =
  | "unauthorized-user"
  | "unauthorized-device"
  | "policy-violation"
  | "inactive"
  | "others";

export type LicenseKeyRevokeReason = {
  id: LicenseKeyRevokeReasonId;
  label: string;
  description?: string;
};

export const LICENSE_KEY_REVOKE_REASONS: LicenseKeyRevokeReason[] = [
  {
    id: "unauthorized-user",
    label: "Unauthorized user",
    description: "User is not authorized to access this system",
  },
  {
    id: "unauthorized-device",
    label: "Unauthorized device",
    description: "Device does not meet system requirements or policy",
  },
  {
    id: "policy-violation",
    label: "Policy violation",
    description: "User has violated company or system policies",
  },
  {
    id: "inactive",
    label: "Inactive",
    description: "Serial Key hasn't been used for a long period",
  },
  {
    id: "others",
    label: "Others",
  },
];
