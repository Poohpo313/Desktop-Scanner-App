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

export const SETTINGS_REVOCATIONS_BINS_REQUEST_TOTAL = 25;

export const SETTINGS_REVOCATIONS_BINS_REQUEST_ROWS: SettingsRevocationRequestRow[] = [
  {
    id: "1",
    requestType: "key-revocation",
    referenceId: "GIREQ-102",
    dateLine: "May 28, 2026",
    timeLine: "08:15 AM",
    status: "pending",
  },
  {
    id: "2",
    requestType: "deletion-request",
    referenceId: "DLREQ-087",
    dateLine: "May 27, 2026",
    timeLine: "03:30 PM",
    status: "pending",
  },
  {
    id: "3",
    requestType: "key-revocation",
    referenceId: "GIREQ-101",
    dateLine: "May 27, 2026",
    timeLine: "03:45 PM",
    status: "approved",
  },
  {
    id: "4",
    requestType: "key-revocation",
    referenceId: "GIREQ-090",
    dateLine: "May 24, 2026",
    timeLine: "11:50 AM",
    status: "rejected",
  },
  {
    id: "5",
    requestType: "deletion-request",
    referenceId: "DLREQ-083",
    dateLine: "May 20, 2026",
    timeLine: "03:00 PM",
    status: "approved",
  },
];

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
  searchQuery: string
): SettingsRevocationRequestRow[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return rows;

  return rows.filter((row) => {
    const typeLabel = displaySettingsRevocationRequestType(row.requestType).toLowerCase();
    return (
      row.referenceId.toLowerCase().includes(query) ||
      typeLabel.includes(query) ||
      row.dateLine.toLowerCase().includes(query) ||
      row.timeLine.toLowerCase().includes(query) ||
      displaySettingsRevocationRequestStatus(row.status).toLowerCase().includes(query)
    );
  });
}
