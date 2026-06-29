import settingsAvatar from "../icons/login/view-contact-profile-avatar.png";

export type AssignedTaskStatus = "pending" | "in-progress" | "completed";

export type AssignedTask = {
  id: string;
  label: string;
  status: AssignedTaskStatus;
};

export const DEMO_ADMIN_SETTINGS = {
  firstName: "Alexander",
  lastName: "Hamilton",
  email: "alexander.h@licensemanager.pro",
  phone: "+1 (555) 0123-4567",
  position: "Senior Compliance Officer",
  username: "alex_hamilton_admin",
  role: "System Administrator",
  adminId: "#LM-992-PX1",
  lastLogin: "Oct 24, 09:12 AM",
  securityStatus: "Secure",
  avatarUrl: settingsAvatar,
  language: "English (United States)",
  timezone: "(GMT-05:00) Eastern Time",
};

export const DEMO_ASSIGNED_TASKS: AssignedTask[] = [
  { id: "task-1", label: "Review License Renewals", status: "pending" },
  { id: "task-2", label: "Update Security Protocols", status: "in-progress" },
  { id: "task-3", label: "Quarterly Audit Report", status: "completed" },
];

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
