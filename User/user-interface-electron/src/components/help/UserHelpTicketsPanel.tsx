import { Ticket, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "../../context/SessionContext";
import "../../styles/user-help-tickets.css";

export type UserHelpTicket = {
  id: number;
  subject: string;
  category: string;
  concernType: string;
  message: string;
  status: string;
  timestamp: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  replyRead?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function UserHelpTicketsPanel({ open, onClose, onUnreadChange }: Props) {
  const { session } = useSession();
  const [tickets, setTickets] = useState<UserHelpTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const unreadCount = useMemo(
    () => tickets.filter((ticket) => ticket.adminReply && ticket.replyRead === false).length,
    [tickets],
  );

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null;

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [onUnreadChange, unreadCount]);

  useEffect(() => {
    if (!open) return;

    void (async () => {
      if (!window.bukolabs?.help) {
        setError("Tickets are available in the desktop app.");
        return;
      }

      setLoading(true);
      setError(null);
      const result = await window.bukolabs.help.listTickets({ userId: session.userId ?? undefined });
      setLoading(false);

      if (!result.success) {
        setTickets([]);
        setError(
          result.error === "Not authenticated with the online API"
            ? "Sign out, connect to the internet, and sign in again to view ticket replies."
            : result.error ?? "Could not load tickets. Sign in while online to view replies.",
        );
        return;
      }

      setTickets(result.data ?? []);
      setSelectedId(result.data?.[0]?.id ?? null);
    })();
  }, [open, session.userId]);

  async function openTicket(ticket: UserHelpTicket) {
    setSelectedId(ticket.id);

    if (ticket.adminReply && ticket.replyRead === false && window.bukolabs?.help) {
      await window.bukolabs.help.markReplyRead({ concernId: ticket.id });
      setTickets((current) =>
        current.map((item) => (item.id === ticket.id ? { ...item, replyRead: true } : item)),
      );
    }
  }

  if (!open) return null;

  return (
    <div className="user-help-tickets-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="user-help-tickets-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Submitted tickets"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="user-help-tickets-panel__header">
          <div className="user-help-tickets-panel__title-wrap">
            <Ticket aria-hidden="true" />
            <h2>My Tickets</h2>
          </div>
          <button type="button" className="user-help-tickets-panel__close" aria-label="Close tickets" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {loading ? <p className="user-help-tickets-panel__status">Loading tickets...</p> : null}
        {error ? <p className="user-help-tickets-panel__status user-help-tickets-panel__status--error">{error}</p> : null}

        {!loading && tickets.length === 0 && !error ? (
          <p className="user-help-tickets-panel__status">No submitted tickets yet.</p>
        ) : null}

        {tickets.length > 0 ? (
          <div className="user-help-tickets-panel__layout">
            <ul className="user-help-tickets-panel__list">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    className={`user-help-tickets-panel__list-item${
                      selectedTicket?.id === ticket.id ? " user-help-tickets-panel__list-item--active" : ""
                    }`}
                    onClick={() => void openTicket(ticket)}
                  >
                    <span className="user-help-tickets-panel__list-title">{ticket.subject}</span>
                    <span className="user-help-tickets-panel__list-meta">
                      {ticket.status}
                      {ticket.adminReply && ticket.replyRead === false ? " · New reply" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {selectedTicket ? (
              <article className="user-help-tickets-panel__detail">
                <h3>{selectedTicket.subject}</h3>
                <p className="user-help-tickets-panel__detail-meta">
                  {selectedTicket.category} · {formatDate(selectedTicket.timestamp)}
                </p>
                <div className="user-help-tickets-panel__message-block">
                  <span>Your message</span>
                  <p>{selectedTicket.message}</p>
                </div>
                {selectedTicket.adminReply ? (
                  <div className="user-help-tickets-panel__reply-block">
                    <span>Support reply</span>
                    <p>{selectedTicket.adminReply}</p>
                    {selectedTicket.repliedAt ? (
                      <small>{formatDate(selectedTicket.repliedAt)}</small>
                    ) : null}
                  </div>
                ) : (
                  <p className="user-help-tickets-panel__waiting">Waiting for support reply.</p>
                )}
              </article>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

type TicketsButtonProps = {
  unreadCount: number;
  onClick: () => void;
};

export function UserHelpTicketsButton({ unreadCount, onClick }: TicketsButtonProps) {
  return (
    <button type="button" className="user-help-tickets-btn" onClick={onClick}>
      <Ticket size={16} aria-hidden="true" />
      <span>Tickets</span>
      {unreadCount > 0 ? (
        <span className="user-help-tickets-btn__badge" aria-label={`${unreadCount} unread replies`}>
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
