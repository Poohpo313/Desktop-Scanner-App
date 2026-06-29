export type SettingsRevocationRequestType = "key-revocation" | "deletion-request";

export type SettingsRevocationRequestStatus = "pending" | "approved" | "rejected";

export type SettingsRevocationRequestRow = {
  id: string;
  requestType: SettingsRevocationRequestType;
  referenceId: string;
  dateLine: string;
  timeLine: string;
  status: SettingsRevocationRequestStatus;
};

export type SettingsRevocationRequestFilter = "all" | SettingsRevocationRequestStatus;

export const SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER_OPTIONS: Array<{
  value: SettingsRevocationRequestFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const DEFAULT_SETTINGS_REVOCATIONS_BINS_REQUEST_FILTER: SettingsRevocationRequestFilter = "all";

export const SETTINGS_REVOCATIONS_BINS_REQUEST_PAGE_SIZE = 5;

export const SETTINGS_REVOCATIONS_BINS_REQUEST_ROWS: SettingsRevocationRequestRow[] = [];

export const SETTINGS_REVOCATIONS_BINS_REQUEST_TOTAL = 0;

export function displaySettingsRevocationRequestType(type: SettingsRevocationRequestType): string {
  return type === "key-revocation" ? "Key Revocation" : "Deletion Request";
}

export function displaySettingsRevocationRequestStatus(status: SettingsRevocationRequestStatus): string {
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  return "Rejected";
}

export function filterSettingsRevocationRequests(
  rows: SettingsRevocationRequestRow[],
  query: string,
  filter: SettingsRevocationRequestFilter
): SettingsRevocationRequestRow[] {
  const normalized = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (filter !== "all" && row.status !== filter) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return (
      row.referenceId.toLowerCase().includes(normalized) ||
      displaySettingsRevocationRequestType(row.requestType).toLowerCase().includes(normalized) ||
      row.dateLine.toLowerCase().includes(normalized) ||
      row.timeLine.toLowerCase().includes(normalized)
    );
  });
}