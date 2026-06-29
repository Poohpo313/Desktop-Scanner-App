import type { AdminUser } from "../types";

export const DEMO_LICENSE_KEY = "BK-9923-XQ-2024";
export const FIGMA_USER_TOTAL = 1284;

export const DEMO_ADMIN_USER: AdminUser = {
  userId: 1,
  username: "john_doe",
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@example.com",
  phoneNumber: "+1 (555) 902-3482",
  accountStatus: "active",
  serialKey: DEMO_LICENSE_KEY,
  createdAt: "2023-10-22T09:12:00.000Z",
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

export const DEMO_USER_LIST: DemoUserListRow[] = [
  {
    id: 1,
    username: "john_doe",
    name: "John Doe",
    key: DEMO_LICENSE_KEY,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    registeredAt: "Oct 22, 2023",
  },
  {
    id: 2,
    username: "asmith",
    name: "Anna Smith",
    key: "BK-1142-XX-2024",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    registeredAt: "Oct 21, 2023",
  },
  {
    id: 3,
    username: "jcruz",
    name: "James Cruz",
    key: "BK-7765-XX-2024",
    status: "inactive",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    registeredAt: "Oct 20, 2023",
  },
  {
    id: 4,
    username: "mlee",
    name: "Maria Lee",
    key: "BK-5521-XX-2024",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    registeredAt: "Oct 19, 2023",
  },
];

const DEMO_CONTACTS: Record<string, Pick<AdminUser, "email" | "phoneNumber">> = {
  john_doe: { email: "johndoe@example.com", phoneNumber: "+1 (555) 902-3482" },
  asmith: { email: "asmith@example.com", phoneNumber: "+1 (555) 201-4412" },
  jcruz: { email: "jcruz@example.com", phoneNumber: "+1 (555) 301-9921" },
  mlee: { email: "mlee@example.com", phoneNumber: "+1 (555) 402-1188" },
};

const DEMO_CREATED_AT: Record<string, string> = {
  john_doe: "2023-10-22T09:12:00.000Z",
  asmith: "2023-10-21T14:30:00.000Z",
  jcruz: "2023-10-20T11:05:00.000Z",
  mlee: "2023-10-19T16:45:00.000Z",
};

const AVATAR_SEEDS = [
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1494790108377-be9c29b29330",
  "photo-1500648767791-00dcc994a43e",
  "photo-1438761681033-6461ffad8d80",
  "photo-1472099645785-5658abf4ff4e",
  "photo-1519345182560-3f2917c472ef",
];

const EXTRA_FIRST = ["Alex", "Blake", "Casey", "Dana", "Elliot", "Finn", "Grace", "Harper", "Ivan", "Jordan"];
const EXTRA_LAST = ["Nguyen", "Patel", "Brooks", "Reed", "Hayes", "Morgan", "Bennett", "Foster", "Gray", "Howard"];

function avatarUrl(seedIndex: number) {
  const seed = AVATAR_SEEDS[seedIndex % AVATAR_SEEDS.length];
  return `https://images.unsplash.com/${seed}?w=80&h=80&fit=crop&crop=face`;
}

function syntheticRegisteredAt(index: number) {
  const day = Math.max(1, 28 - (index % 28));
  const month = 10 - Math.floor(index / 30) % 10;
  const year = 2023 - Math.floor(index / 365);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const safeMonth = months[Math.max(0, Math.min(11, month))];
  return `${safeMonth} ${day}, ${year}`;
}

function syntheticCreatedAt(index: number) {
  const date = new Date(2023, 9, 22);
  date.setDate(date.getDate() - index);
  return date.toISOString();
}

/** Zero-based index into the full 1,284-user figma catalog. */
export function getFigmaUserListRow(index: number): DemoUserListRow {
  if (index >= 0 && index < DEMO_USER_LIST.length) {
    return DEMO_USER_LIST[index];
  }

  const syntheticIndex = index - DEMO_USER_LIST.length;
  const id = index + 1;
  const firstName = EXTRA_FIRST[syntheticIndex % EXTRA_FIRST.length];
  const lastName = EXTRA_LAST[(syntheticIndex * 2) % EXTRA_LAST.length];
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}`;

  return {
    id,
    username,
    name: `${firstName} ${lastName}`,
    key: `BK-${String(1000 + (id % 9000)).padStart(4, "0")}-XX-2024`,
    status: id % 7 === 0 ? "inactive" : "active",
    avatar: avatarUrl(syntheticIndex + 4),
    registeredAt: syntheticRegisteredAt(syntheticIndex),
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
  const contact = DEMO_CONTACTS[row.username];

  return {
    userId: Number(row.id) || 1,
    username: row.username,
    firstName,
    lastName: rest.join(" "),
    email: contact?.email ?? `${row.username}@example.com`,
    phoneNumber: contact?.phoneNumber ?? `+1 (555) ${String(100 + (Number(row.id) % 900)).padStart(3, "0")}-${String(1000 + (Number(row.id) % 9000)).padStart(4, "0")}`,
    accountStatus: row.status,
    serialKey: row.key,
    createdAt: DEMO_CREATED_AT[row.username] ?? syntheticCreatedAt(Number(row.id)),
  };
}

export function getDemoAdminUserById(userId: number | string | undefined): AdminUser {
  const id = Number(userId);
  if (!Number.isFinite(id) || id < 1 || id > FIGMA_USER_TOTAL) {
    return DEMO_ADMIN_USER;
  }

  const row = getFigmaUserListRow(id - 1);
  return demoRowToAdminUser(row);
}

export function figmaUserDetailPath(userId: number | string) {
  return `/user-management-user-details/${userId}`;
}
