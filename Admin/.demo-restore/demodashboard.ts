import type { NotificationCenterIconTone } from "./demoNotificationsCenter";

export type DashboardActivityStatus = "success" | "pending" | "failed";

export type DashboardActivityRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  action: string;
  status: DashboardActivityStatus;
  timestamp: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  subtitle: string;
  iconTone: NotificationCenterIconTone;
};

export const DASHBOARD_FIGMA_STATS = {
  totalUsers: 1284,
  activeDevices: 1138,
  assignedKeys: 1138,
  availableKeys: 146,
  deviceTotal: 1196,
  deviceActive: 1138,
  deviceInactive: 44,
  deviceAttention: 14,
  keyUtilizationPct: 89,
  keysUsed: 1196,
  keysTotal: 1284,
} as const;

export const DASHBOARD_ACTIVITY_ROW_COUNT = 5;

export const DASHBOARD_ACTIVITY_ROWS: DashboardActivityRow[] = [
  {
    id: "act-1",
    name: "Anna Smith",
    email: "asmith@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    action: "Approved User Registration Request ID: REG-1021",
    status: "success",
    timestamp: "Oct 24, 2023 · 2:45 PM",
  },
  {
    id: "act-2",
    name: "James Cruz",
    email: "jcruz@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    action: "License Assignment Request ID: KEY-2044",
    status: "pending",
    timestamp: "Oct 24, 2023 · 1:18 PM",
  },
  {
    id: "act-3",
    name: "Maria Lee",
    email: "mlee@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    action: "Device Provisioning Request ID: DEV-8812",
    status: "success",
    timestamp: "Oct 24, 2023 · 11:52 AM",
  },
  {
    id: "act-4",
    name: "John Doe",
    email: "johndoe@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    action: "User Access Revocation Request ID: REV-1093",
    status: "failed",
    timestamp: "Oct 24, 2023 · 9:30 AM",
  },
  {
    id: "act-5",
    name: "Sarah Chen",
    email: "schen@example.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    action: "Completed License Key Renewal Request ID: KEY-3310",
    status: "success",
    timestamp: "Oct 24, 2023 · 8:05 AM",
  },
];

export const DASHBOARD_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "n-1",
    title: "5 New User Registrations",
    subtitle: "Awaiting role assignments.",
    iconTone: "green-user",
  },
  {
    id: "n-2",
    title: "3 License Assignment Requests Completed",
    subtitle: "Sent to user emails.",
    iconTone: "blue-check",
  },
  {
    id: "n-3",
    title: "2 Revocation Requests Awaiting Approval",
    subtitle: "Urgent review required.",
    iconTone: "red-shield",
  },
  {
    id: "n-4",
    title: "2 Revocation Requests Approved",
    subtitle: "Approved by Super Administrator.",
    iconTone: "green-check",
  },
];
