export const ISSUE_CATEGORIES = [
  { id: "scanner", label: "Scanner / Device Problem" },
  { id: "files", label: "File Handling / Documents" },
  { id: "account", label: "Account / Sign-in" },
  { id: "cloud-sync", label: "Cloud Sync" },
  { id: "performance", label: "Performance / Crashes" },
  { id: "other", label: "Other Issue" },
] as const;

export type IssueCategoryId = (typeof ISSUE_CATEGORIES)[number]["id"];

export type ReportIssuePayload = {
  category: IssueCategoryId;
  description: string;
  screenshotName: string | null;
};
