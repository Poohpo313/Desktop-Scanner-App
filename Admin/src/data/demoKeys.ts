export const KEY_CATALOG_TOTAL = 0;
export const KEY_CATALOG_PAGE_COUNT = 0;

export const KEY_CATALOG_STATS = {
  total: 0,
  active: 0,
  assigned: 0,
  available: 0,
  revoked: 0,
  utilization: 0,
};

export const FIGMA_KEY_TOTAL = KEY_CATALOG_TOTAL;
export const FIGMA_KEY_PAGE_COUNT = KEY_CATALOG_PAGE_COUNT;

export const FIGMA_KEY_STATS = KEY_CATALOG_STATS;

export type DemoKeyListRow = {
  id: string;
  key: string;
  user: string;
  status: "assigned" | "active" | "unused" | "revoked" | "deactivated";
  date: string;
};

export const DEMO_KEY_LIST: DemoKeyListRow[] = [];

export type KeyActivityItem = {
  id: string;
  label: string;
  time: string;
  type: "generated" | "assigned" | "revoked" | "audit";
};

export const KEY_RECENT_ACTIVITY: KeyActivityItem[] = [];

export function getFigmaKeyListRow(index: number): DemoKeyListRow {
  return {
    id: "",
    key: "",
    user: "",
    status: "unused",
    date: "",
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
