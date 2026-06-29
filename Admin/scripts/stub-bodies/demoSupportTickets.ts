export type SupportTicketStatus = "open" | "pending" | "urgent" | "resolved";

export type SupportTicketRow = {
  id: string;
  userName: string;
  avatarUrl?: string;
  initials?: string;
  issue: string;
  status: SupportTicketStatus;
  dateLine: string;
  timeLine: string;
};

export const FIGMA_SUPPORT_TOTAL = 0;

export const FIGMA_SUPPORT_STATS = {
  openTickets: 0,
  resolvedToday: 0,
  pendingResponse: 0,
  averageResolution: "",
  total: 0,
};

export const DEMO_SUPPORT_TICKETS: SupportTicketRow[] = [];

export function displayTicketStatus(status: SupportTicketStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "pending":
      return "Pending";
    case "urgent":
      return "Urgent";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
}

export function ticketStatusPillClass(status: SupportTicketStatus): string {
  switch (status) {
    case "open":
      return "open";
    case "pending":
      return "pending";
    case "urgent":
      return "urgent";
    case "resolved":
      return "resolved";
    default:
      return "open";
  }
}