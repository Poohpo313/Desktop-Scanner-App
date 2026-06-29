export type DeleteUserProfileReasonId =
  | "unauthorized-user"
  | "unauthorized-device"
  | "inactive"
  | "data-privacy-request"
  | "others";

export type DeleteUserProfileReason = {
  id: DeleteUserProfileReasonId;
  label: string;
  description?: string;
};

export const DELETE_USER_PROFILE_REASONS: DeleteUserProfileReason[] = [
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
    id: "inactive",
    label: "Inactive",
    description: "User has not been active for an extended period of time",
  },
  {
    id: "data-privacy-request",
    label: "Data privacy request",
    description: "User requested removal of their data",
  },
  {
    id: "others",
    label: "Others",
  },
];
