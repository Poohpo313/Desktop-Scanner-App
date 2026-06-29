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

export const FIGMA_SUPPORT_TOTAL = 42;

export const FIGMA_SUPPORT_STATS = {
  openTickets: 42,
  resolvedToday: 18,
  pendingResponse: 9,
  averageResolution: "4h 22m",
  total: FIGMA_SUPPORT_TOTAL,
};

export const DEMO_SUPPORT_TICKETS: SupportTicketRow[] = [
  {
    id: "TKT-001",
    userName: "Johnathan Drexler",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    issue: "Activation Error",
    status: "open",
    dateLine: "Oct 24,",
    timeLine: "09:12 AM",
  },
  {
    id: "TKT-002",
    userName: "Sarah Jenkins",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    issue: "Scanner Sync Failure",
    status: "pending",
    dateLine: "Oct 24,",
    timeLine: "08:55 AM",
  },
  {
    id: "TKT-003",
    userName: "Marcus Sterling",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    issue: "Security Breach Report",
    status: "urgent",
    dateLine: "Oct 23,",
    timeLine: "04:30 PM",
  },
  {
    id: "TKT-004",
    userName: "Elena Rodriguez",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    issue: "User Account Locked",
    status: "open",
    dateLine: "Oct 23,",
    timeLine: "02:15 PM",
  },
  {
    id: "TKT-005",
    userName: "Maria Keller",
    initials: "MK",
    issue: "Billing Inquiry",
    status: "pending",
    dateLine: "Oct 23,",
    timeLine: "11:45 AM",
  },
  {
    id: "TKT-006",
    userName: "Alex Nguyen",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    issue: "Activation Timeout",
    status: "resolved",
    dateLine: "Oct 22,",
    timeLine: "10:00 AM",
  },
];

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
