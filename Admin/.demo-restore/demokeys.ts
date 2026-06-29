export const FIGMA_KEY_TOTAL = 8421;
export const FIGMA_KEY_PAGE_COUNT = 12;

export const FIGMA_KEY_STATS = {
  total: FIGMA_KEY_TOTAL,
  active: 900,
  assigned: 942,
  available: 7452,
  revoked: 27,
  utilization: 11,
};

export type DemoKeyListRow = {
  id: string;
  key: string;
  user: string;
  status: "assigned" | "active" | "unused" | "revoked" | "deactivated";
  date: string;
};

export const DEMO_KEY_LIST: DemoKeyListRow[] = [
  {
    id: "KEY001",
    key: "ABCD-1234-EFGH",
    user: "John Doe",
    status: "assigned",
    date: "06/01/2026",
  },
  {
    id: "KEY002",
    key: "ZXCV-5678-QWER",
    user: "Maria Santos",
    status: "active",
    date: "06/01/2026",
  },
  {
    id: "KEY003",
    key: "POIU-9999-ASDF",
    user: "—",
    status: "revoked",
    date: "05/31/2026",
  },
];

export type KeyActivityItem = {
  id: string;
  label: string;
  time: string;
  type: "generated" | "assigned" | "revoked" | "audit";
};

export const KEY_RECENT_ACTIVITY: KeyActivityItem[] = [
  { id: "1", label: "KEY-99231 Generated", time: "2 mins ago", type: "generated" },
  { id: "2", label: "KEY-99230 Assigned", time: "10 mins ago", type: "assigned" },
  { id: "3", label: "KEY-99215 Revoked", time: "30 mins ago", type: "revoked" },
  { id: "4", label: "Admin viewed audit log", time: "1 hour ago", type: "audit" },
];

const DEMO_USERS = ["John Doe", "Maria Santos", "James Cruz", "Anna Smith", "Maria Lee"];
const KEY_PREFIXES = ["ABCD", "ZXCV", "POIU", "QWER", "ASDF", "HJKL", "MNBV"];

function formatKeyDate(index: number) {
  const day = Math.max(1, 28 - (index % 28));
  const month = String(Math.max(1, 6 - Math.floor(index / 30))).padStart(2, "0");
  return `${month}/${String(day).padStart(2, "0")}/2026`;
}

/** Zero-based index into the full figma key catalog. */
export function getFigmaKeyListRow(index: number): DemoKeyListRow {
  if (index >= 0 && index < DEMO_KEY_LIST.length) {
    return DEMO_KEY_LIST[index];
  }

  const syntheticIndex = index - DEMO_KEY_LIST.length;
  const idNumber = index + 1;
  const prefix = KEY_PREFIXES[syntheticIndex % KEY_PREFIXES.length];
  const statusCycle = syntheticIndex % 9;

  let status: DemoKeyListRow["status"] = "active";
  if (statusCycle === 0) status = "revoked";
  else if (statusCycle === 1 || statusCycle === 2) status = "assigned";
  else if (statusCycle === 3) status = "unused";

  const user =
    status === "assigned" || status === "active"
      ? DEMO_USERS[syntheticIndex % DEMO_USERS.length]
      : "—";

  return {
    id: `KEY${String(idNumber).padStart(3, "0")}`,
    key: `${prefix}-${String(1000 + (idNumber % 9000)).padStart(4, "0")}-${String(2000 + (idNumber % 50)).slice(-4)}`,
    user,
    status,
    date: formatKeyDate(syntheticIndex),
  };
}

export function displayKeyStatus(status: string): string {
  if (status === "assigned" || status === "used") return "Assigned";
  if (status === "revoked" || status === "deactivated") return "Revoked";
  if (status === "unused") return "Available";
  return "Active";
}

export function keyStatusPillClass(status: string): string {
  if (status === "revoked" || status === "deactivated") return "revoked";
  if (status === "assigned" || status === "used") return "assigned";
  return "active";
}
