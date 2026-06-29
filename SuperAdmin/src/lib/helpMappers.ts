import type { UserConcernRow } from "../api/userConcerns.api";

export type HelpRequestRow = {
  id: string;
  serialKey: string;
  organization: string;
  department: string;
  subject: string;
  category: string;
  concernType: string;
  message: string;
  email: string | null;
  rating: number | null;
  date: string;
  timeLine: string;
  status: "Open" | "Pending" | "In Progress" | "Resolved" | "Closed";
  requester?: string;
};

function mapConcernStatus(status: string): HelpRequestRow["status"] {
  const normalized = status.toLowerCase();
  if (normalized.includes("resolved")) return "Resolved";
  if (normalized.includes("closed")) return "Closed";
  if (normalized.includes("progress")) return "In Progress";
  if (normalized.includes("pending")) return "Pending";
  return "Open";
}

function formatHelpTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function mapUserConcernsToHelpRequests(concerns: UserConcernRow[]): HelpRequestRow[] {
  return concerns.map((concern) => ({
    id: String(concern.id),
    serialKey: concern.username,
    organization: concern.company ?? "-",
    department: concern.department ?? "-",
    subject: concern.subject,
    category: concern.category,
    concernType: concern.concernType,
    message: concern.message,
    email: concern.email,
    rating: concern.rating,
    date: concern.timestamp.slice(0, 10),
    timeLine: formatHelpTime(concern.timestamp),
    status: mapConcernStatus(concern.status),
    requester: concern.email ?? concern.username,
  }));
}

export function formatConcernType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "feedback") return "Feedback";
  if (normalized === "issue") return "Issue Report";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatConcernRating(rating: number | null) {
  if (rating == null) return null;
  return `${rating} / 5`;
}
