export type AssistanceTab = "pending" | "active" | "resolved";

export type PriorityTicket = {
  id: string;
  name: string;
  avatarUrl: string;
  timeAgo: string;
  message: string;
  priority: "urgent" | "normal";
  status: "pending" | "resolved";
  resolvedAt?: string;
};

export type ActiveChat = {
  id: string;
  title: string;
  preview: string;
  icon: "support" | "database";
  status: string;
};

export type ChatMessage = {
  id: string;
  sender: "customer" | "agent" | "you";
  senderName: string;
  text: string;
  time: string;
};

export const ASSISTANCE_TABS: { id: AssistanceTab; label: string }[] = [
  { id: "pending", label: "Pending Tickets" },
  { id: "active", label: "Active Chats" },
  { id: "resolved", label: "Resolved" },
];

export const HIGH_PRIORITY_TICKETS: PriorityTicket[] = [];

export const PENDING_CONCERNS_COUNT = 0;

export const ACTIVE_CHATS: ActiveChat[] = [];

export const CHAT_CONVERSATIONS: Record<string, ChatMessage[]> = {};

export function getChatById(chatId: string): ActiveChat | undefined {
  return ACTIVE_CHATS.find((chat) => chat.id === chatId);
}

export function countPendingTickets(tickets: PriorityTicket[]): number {
  return tickets.filter((ticket) => ticket.status === "pending").length;
}

export function filterPriorityTickets(tickets: PriorityTicket[], query: string): PriorityTicket[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tickets;

  return tickets.filter(
    (ticket) =>
      ticket.name.toLowerCase().includes(normalized) ||
      ticket.message.toLowerCase().includes(normalized)
  );
}
