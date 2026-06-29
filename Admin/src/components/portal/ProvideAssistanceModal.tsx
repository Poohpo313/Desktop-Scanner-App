import { useMemo, useState, type FormEvent } from "react";
import FigmaModal from "./FigmaModal";
import { IconSearch } from "../icons/AdminIcons";
import { useNotificationStore } from "../../store/notificationStore";
import {
  ACTIVE_CHATS,
  ASSISTANCE_TABS,
  CHAT_CONVERSATIONS,
  HIGH_PRIORITY_TICKETS,
  countPendingTickets,
  filterPriorityTickets,
  getChatById,
  type ActiveChat,
  type AssistanceTab,
  type ChatMessage,
  type PriorityTicket,
} from "../../data/provideAssistanceData";
import closeIcon from "../../icons/Modal Header/Icon-209.svg";
import newTicketIcon from "../../icons/provide-assistance-new-ticket-icon.svg";
import nodeSyncSupportIcon from "../../icons/provide-assistance-node-sync-support-icon.svg";
import databaseMigrationIcon from "../../icons/provide-assistance-database-migration-icon.svg";
import "../../styles/provide-assistance-modal.css";

type Props = {
  closeTo?: string;
  onClose?: () => void;
};

function ChatIcon({ type }: { type: ActiveChat["icon"] }) {
  if (type === "support") {
    return (
      <img
        src={nodeSyncSupportIcon}
        alt=""
        className="provide-assistance__chat-icon-img"
        draggable={false}
      />
    );
  }

  if (type === "database") {
    return (
      <img
        src={databaseMigrationIcon}
        alt=""
        className="provide-assistance__chat-icon-img"
        draggable={false}
      />
    );
  }

  return null;
}

function IconNewTicket({ className }: { className?: string }) {
  return (
    <img
      src={newTicketIcon}
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}

function IconBack({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 3.5L5.5 8L10 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.75 8H13.25M13.25 8L9 3.75M13.25 8L9 12.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type TicketCardProps = {
  ticket: PriorityTicket;
  onAccept?: (ticketId: string) => void;
};

function TicketCard({ ticket, onAccept }: TicketCardProps) {
  const isResolved = ticket.status === "resolved";

  return (
    <article
      className={`provide-assistance__ticket${isResolved ? " provide-assistance__ticket--resolved" : ""}`}
    >
      <div className="provide-assistance__ticket-top">
        <div className="provide-assistance__ticket-user">
          <img
            src={ticket.avatarUrl}
            alt=""
            className="provide-assistance__avatar"
            draggable={false}
          />
          <span className="provide-assistance__ticket-name">{ticket.name}</span>
        </div>
        <span className="provide-assistance__ticket-time">
          {isResolved ? ticket.resolvedAt ?? ticket.timeAgo : ticket.timeAgo}
        </span>
      </div>
      <p className="provide-assistance__ticket-message">&ldquo;{ticket.message}&rdquo;</p>
      {isResolved ? (
        <div className="provide-assistance__ticket-resolved">
          <span className="provide-assistance__resolved-badge">Resolved</span>
          <span className="provide-assistance__resolved-note">Request accepted and assigned to you</span>
        </div>
      ) : (
        <div className="provide-assistance__ticket-actions">
          <button
            type="button"
            className="figma-btn figma-btn--primary provide-assistance__accept-btn"
            onClick={() => onAccept?.(ticket.id)}
          >
            Accept Request
          </button>
          <button
            type="button"
            className="provide-assistance__more-btn"
            aria-label={`More options for ${ticket.name}`}
          >
            <span aria-hidden="true">⋯</span>
          </button>
        </div>
      )}
    </article>
  );
}

type ConversationPanelProps = {
  chat: ActiveChat;
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
};

function ConversationPanel({
  chat,
  messages,
  draft,
  onDraftChange,
  onSend,
  onBack,
}: ConversationPanelProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSend();
  };

  return (
    <section className="provide-assistance__conversation" aria-label={`Conversation with ${chat.title}`}>
      <div className="provide-assistance__conversation-head">
        <button type="button" className="provide-assistance__conversation-back" onClick={onBack}>
          <IconBack className="provide-assistance__conversation-back-icon" />
          Back
        </button>
        <div className="provide-assistance__conversation-title-wrap">
          <span className={`provide-assistance__chat-icon provide-assistance__chat-icon--${chat.icon}`}>
            <ChatIcon type={chat.icon} />
          </span>
          <div>
            <h3 className="provide-assistance__conversation-title">{chat.title}</h3>
            <p className="provide-assistance__conversation-status">{chat.status}</p>
          </div>
        </div>
      </div>

      <div className="provide-assistance__messages" role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`provide-assistance__message provide-assistance__message--${message.sender}`}
          >
            <div className="provide-assistance__message-meta">
              <span className="provide-assistance__message-sender">{message.senderName}</span>
              <span className="provide-assistance__message-time">{message.time}</span>
            </div>
            <p className="provide-assistance__message-text">{message.text}</p>
          </article>
        ))}
      </div>

      <form className="provide-assistance__compose" onSubmit={handleSubmit}>
        <label className="provide-assistance__compose-field">
          <span className="sr-only">Reply to {chat.title}</span>
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Type your reply..."
          />
        </label>
        <button type="submit" className="figma-btn figma-btn--primary provide-assistance__send-btn" disabled={!draft.trim()}>
          <IconSend className="provide-assistance__send-icon" />
          Send
        </button>
      </form>
    </section>
  );
}

export default function ProvideAssistanceModal({
  closeTo = "/admin-dashboard-2226-1193",
  onClose,
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const [activeTab, setActiveTab] = useState<AssistanceTab>("pending");
  const [query, setQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(CHAT_CONVERSATIONS);
  const [draftByChat, setDraftByChat] = useState<Record<string, string>>({});
  const [tickets, setTickets] = useState<PriorityTicket[]>(HIGH_PRIORITY_TICKETS);

  const selectedChat = selectedChatId ? getChatById(selectedChatId) : undefined;
  const selectedMessages = selectedChatId ? chatMessages[selectedChatId] ?? [] : [];
  const selectedDraft = selectedChatId ? draftByChat[selectedChatId] ?? "" : "";

  const pendingTickets = useMemo(
    () => filterPriorityTickets(
      tickets.filter((ticket) => ticket.status === "pending"),
      query
    ),
    [tickets, query]
  );

  const resolvedTickets = useMemo(
    () => filterPriorityTickets(
      tickets.filter((ticket) => ticket.status === "resolved"),
      query
    ),
    [tickets, query]
  );

  const pendingConcernCount = countPendingTickets(tickets);

  const handleAccept = (ticketId: string) => {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.status === "resolved") return;

    setTickets((current) =>
      current.map((item) =>
        item.id === ticketId
          ? { ...item, status: "resolved", resolvedAt: "Just now" }
          : item
      )
    );
    setActiveTab("resolved");
    push(`Accepted request from ${ticket.name}`, "success");
  };

  const openChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab("active");
  };

  const closeChat = () => {
    setSelectedChatId(null);
  };

  const handleSendMessage = () => {
    if (!selectedChatId || !selectedDraft.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "you",
      senderName: "You",
      text: selectedDraft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    setChatMessages((current) => ({
      ...current,
      [selectedChatId]: [...(current[selectedChatId] ?? []), newMessage],
    }));
    setDraftByChat((current) => ({ ...current, [selectedChatId]: "" }));
  };

  const listFooter = (
    <div className="provide-assistance__footer">
      <label className="provide-assistance__search">
        <IconSearch className="provide-assistance__search-icon" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter tickets by keyword..."
          aria-label="Filter tickets"
        />
      </label>
      <button type="button" className="provide-assistance__advanced-btn">
        Advanced Search
      </button>
      <button
        type="button"
        className="figma-btn figma-btn--primary provide-assistance__new-btn"
        onClick={() => push("New ticket form coming soon", "info")}
      >
        <IconNewTicket className="provide-assistance__new-icon" />
        New Ticket
      </button>
    </div>
  );

  return (
    <FigmaModal
      className="figma-modal--provide-assistance"
      title="Provide Assistance"
      subtitle={`${pendingConcernCount} Pending Concern${pendingConcernCount === 1 ? "" : "s"}`}
      wide
      onClose={onClose ? undefined : closeTo}
      onDismiss={onClose}
      closeIcon={<img src={closeIcon} alt="" aria-hidden="true" />}
      footer={selectedChat ? undefined : listFooter}
      footerClassName="provide-assistance__footer-wrap"
    >
      <div className="provide-assistance__tabs" role="tablist" aria-label="Assistance views">
        {ASSISTANCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`provide-assistance__tab${activeTab === tab.id ? " provide-assistance__tab--active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== "active") {
                setSelectedChatId(null);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`provide-assistance__layout${selectedChat ? " provide-assistance__layout--conversation" : ""}`}>
        {selectedChat ? (
          <ConversationPanel
            chat={selectedChat}
            messages={selectedMessages}
            draft={selectedDraft}
            onDraftChange={(value) =>
              setDraftByChat((current) => ({ ...current, [selectedChat.id]: value }))
            }
            onSend={handleSendMessage}
            onBack={closeChat}
          />
        ) : (
          <section className="provide-assistance__main" aria-label="High-priority tickets">
            <div className="provide-assistance__section-head">
              <h3 className="provide-assistance__section-title">
                {activeTab === "resolved" ? "Resolved Tickets" : "High-Priority Tickets"}
              </h3>
              {activeTab !== "resolved" && (
                <span className="provide-assistance__urgent-badge">Urgent</span>
              )}
            </div>

            {activeTab === "pending" ? (
              <div className="provide-assistance__ticket-list">
                {pendingTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onAccept={handleAccept} />
                ))}
                {pendingTickets.length === 0 && (
                  <p className="provide-assistance__empty">
                    {query.trim() ? "No tickets match your filter." : "No pending high-priority tickets."}
                  </p>
                )}
              </div>
            ) : activeTab === "active" ? (
              <p className="provide-assistance__empty">
                Select a chat on the right to view the conversation.
              </p>
            ) : (
              <div className="provide-assistance__ticket-list">
                {resolvedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
                {resolvedTickets.length === 0 && (
                  <p className="provide-assistance__empty">
                    {query.trim() ? "No resolved tickets match your filter." : "No resolved tickets yet."}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <aside className="provide-assistance__sidebar" aria-label="Recent chats">
          <h3 className="provide-assistance__sidebar-title">Jump back into Chat</h3>
          <ul className="provide-assistance__chat-list">
            {ACTIVE_CHATS.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  className={`provide-assistance__chat-item${selectedChatId === chat.id ? " provide-assistance__chat-item--active" : ""}`}
                  onClick={() => openChat(chat.id)}
                  aria-current={selectedChatId === chat.id ? "true" : undefined}
                >
                  <span
                    className={`provide-assistance__chat-icon provide-assistance__chat-icon--${chat.icon}`}
                    aria-hidden="true"
                  >
                    <ChatIcon type={chat.icon} />
                  </span>
                  <span className="provide-assistance__chat-meta">
                    <span className="provide-assistance__chat-title">{chat.title}</span>
                    <span className="provide-assistance__chat-preview">{chat.preview}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </FigmaModal>
  );
}
