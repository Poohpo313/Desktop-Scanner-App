export type UserRole = "admin" | "super_admin" | "user";

export type AdminUser = {
  userId: number;
  username: string;
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  company?: string | null;
  accountStatus: string;
  serialKey?: string | null;
  createdAt?: string;
  roleId?: number | null;
};

export type SerialKey = {
  serialId: number;
  serialKey: string;
  assignedTo?: number | null;
  status: string;
  generatedAt?: string;
  usedAt?: string | null;
  expiresAt?: string | null;
  company?: string | null;
  department?: string | null;
};

export type Device = {
  deviceId: number;
  deviceName?: string | null;
  deviceType?: string | null;
  serialNumber?: string | null;
  assignedUser?: number | null;
  status: string;
  lastSeen?: string | null;
  isPrimary?: boolean | null;
  parentDeviceId?: number | null;
  parentDeviceName?: string | null;
  warningNote?: string | null;
  isOnline?: boolean;
  licenseSerialKey?: string | null;
};

export type ActivityLog = {
  action: string;
  timestamp: string;
  userId?: number;
  details?: string;
};

export type ReportSummary = {
  totalUsers: number;
  activeUsers?: number;
  inactiveUsers?: number;
  activeKeys: number;
  usedKeys?: number;
  revokedKeys?: number;
  registeredDevices: number;
  activeDevices?: number;
  recentActivity?: ActivityLog[];
  keyUsage?: { name: string; value: number }[];
  userStatus?: { name: string; value: number }[];
  filesPerDay: { day: string; count: number }[];
};
