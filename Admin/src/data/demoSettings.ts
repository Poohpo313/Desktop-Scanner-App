export type AssignedTaskStatus = "pending" | "in-progress" | "completed";

export type AssignedTask = {
  id: string;
  label: string;
  status: AssignedTaskStatus;
};

export const DEMO_ADMIN_SETTINGS = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  username: "",
  role: "",
  adminId: "",
  lastLogin: "",
  securityStatus: "",
  avatarUrl: "",
  language: "",
  timezone: "",
};

export const DEMO_ASSIGNED_TASKS: AssignedTask[] = [];

export function displayTaskStatus(status: AssignedTaskStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function taskStatusClass(status: AssignedTaskStatus): string {
  switch (status) {
    case "pending":
      return "pending";
    case "in-progress":
      return "in-progress";
    case "completed":
      return "completed";
    default:
      return "pending";
  }
}
