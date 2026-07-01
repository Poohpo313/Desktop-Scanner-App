export type UserRole = "superadmin" | "admin" | "user";

export type AdminAccount = {
  adminId: number;
  username: string;
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  departments?: string[] | null;
  company?: string | null;
  roleId?: number | null;
  accountStatus: string;
  createdAt?: string;
};

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
};

export type SerialKey = {
  serialId: number;
  serialKey: string;
  assignedTo?: number | null;
  status: string;
  generatedAt?: string;
  usedAt?: string | null;
  expiresAt?: string | null;
  durationDays?: number | null;
  extensionCount?: number;
  username?: string | null;
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

export type CloudStorage = {
  totalGb: number;
  usedGb: number;
  percent: number;
  perUser?: { userId: number; username: string; usedGb: number; quotaGb: number }[];
};

export type VerificationRequest = {
  userId: number;
  username: string;
  email?: string;
  requestedAt: string;
};

export type BackupRecord = {
  id: number;
  version: string;
  sizeMb: number;
  encrypted: boolean;
  createdAt: string;
  status?: string;
};

export type RoleDef = {
  roleId: number;
  roleName: string;
  permissions: string[];
};

export type SystemConfig = {
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  maxDevicesPerUser: number;
  cloudStorageGb: number;
  backupRetentionDays: number;
  backupDailyEnabled: boolean;
  language: string;
  timezone: string;
  scannerDefaults: { dpi: number; colorMode: string; pageSize: string };
  policies: {
    userSessionMinutes: number;
    adminSessionMinutes: number;
    superAdminSessionMinutes: number;
  };
};

export type ActivityLog = {
  action: string;
  timestamp: string;
  userId?: number;
};

export type RevocationRecord = {
  recordId: string;
  serialId?: number | null;
  deviceId?: number | null;
  serialKey: string;
  status?: string;
  generatedAt?: string;
  revokedAt?: string;
  company?: string | null;
  department?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  action?: string | null;
  reason?: string | null;
  revokedByUsername?: string | null;
  revokedByFirstName?: string | null;
  revokedByLastName?: string | null;
  revokedByRole?: string | null;
  requestId?: number | null;
  requestStatus?: string | null;
};

export type ReportSummary = {
  totalUsers: number;
  activeKeys: number;
  registeredDevices: number;
  recentActivity?: ActivityLog[];
  filesPerDay: { day: string; count: number }[];
  scannerActivity?: {
    today: Array<{ label: string; activations: number; registrations: number }>;
    thisWeek: Array<{ label: string; activations: number; registrations: number }>;
    thisMonth: Array<{ label: string; activations: number; registrations: number }>;
    thisYear: Array<{ label: string; activations: number; registrations: number }>;
  };
};
