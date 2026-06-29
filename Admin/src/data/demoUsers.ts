import type { AdminUser } from "../types";

export const EMPTY_LICENSE_KEY = "";

export const DEMO_LICENSE_KEY = "";
export const FIGMA_USER_TOTAL = 0;

export const DEMO_ADMIN_USER: AdminUser = {
  userId: 0,
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  accountStatus: "active",
  serialKey: "",
  createdAt: "",
};

export type DemoUserListRow = {
  id: number;
  username: string;
  name: string;
  key: string;
  status: "active" | "inactive";
  avatar: string;
  registeredAt: string;
};

export const DEMO_USER_LIST: DemoUserListRow[] = [];

export function getFigmaUserListRow(index: number): DemoUserListRow {
  return {
    id: index + 1,
    username: "",
    name: "",
    key: "",
    status: "active",
    avatar: "",
    registeredAt: "",
  };
}

export function demoRowToAdminUser(row: {
  id: string | number;
  username: string;
  name: string;
  key: string;
  status: "active" | "inactive";
  registeredAt?: string;
}): AdminUser {
  const [firstName, ...rest] = row.name.split(" ");
  return {
    userId: Number(row.id) || 0,
    username: row.username,
    firstName,
    lastName: rest.join(" "),
    email: "",
    phoneNumber: "",
    accountStatus: row.status,
    serialKey: row.key,
    createdAt: "",
  };
}

export function getDemoAdminUserById(_userId: number | string | undefined): AdminUser {
  return DEMO_ADMIN_USER;
}

export function figmaUserDetailPath(userId: number | string) {
  return `/user-management-user-details/${userId}`;
}
