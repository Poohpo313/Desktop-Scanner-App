import { CloudOff, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppErrorState } from "../common/AppErrorState";
import { AppStatusBar } from "../layout/AppStatusBar";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import { useSession } from "../../context/SessionContext";
import {
  HELP_ARTICLES,
  filterHelpTopics,
  resolveHelpTopicId,
} from "./helpAssistantData";
import { ISSUE_CATEGORIES } from "./reportIssueData";
import { SendFeedbackModal } from "./SendFeedbackModal";
import type { SendFeedbackPayload } from "./sendFeedbackData";
import { ReportIssueModal } from "./ReportIssueModal";
import type { ReportIssuePayload } from "./reportIssueData";
import { FeedbackSubmittedModal } from "./FeedbackSubmittedModal";
import { ReportSubmittedModal } from "./ReportSubmittedModal";
import { UserHelpTicketsButton, UserHelpTicketsPanel } from "./UserHelpTicketsPanel";
import "../../styles/dashboard.css";
import "../../styles/help-assistant-page.css";
import "../../styles/user-help-tickets.css";

const VISIBLE_TOPIC_COUNT = 4;

export function HelpAssistantPageView() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [selectedTopicId, setSelectedTopicId] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [showSendFeedbackModal, setShowSendFeedbackModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showFeedbackSubmittedModal, setShowFeedbackSubmittedModal] = useState(false);
  const [showReportSubmittedModal, setShowReportSubmittedModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [ticketUnreadCount, setTicketUnreadCount] = useState(0);
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    if (!session.token || !window.bukolabs?.auth) return;

    void window.bukolabs.auth.getProfile({ token: session.token }).then((result) => {
      if (result.success && result.profile?.email) {
        setProfileEmail(result.profile.email);
      }
    });
  }, [session.token]);

  const defaultFeedbackEmail = profileEmail;

  const filteredTopics = useMemo(() => filterHelpTopics(searchQuery), [searchQuery]);

  const visibleTopics = useMemo(() => {
    if (showAllTopics || searchQuery.trim()) return filteredTopics;
    return filteredTopics.slice(0, VISIBLE_TOPIC_COUNT);
  }, [filteredTopics, searchQuery, showAllTopics]);

  const canToggleAllTopics =
    !searchQuery.trim() && filteredTopics.length > VISIBLE_TOPIC_COUNT;

  const activeTopicId = useMemo(
    () => resolveHelpTopicId(selectedTopicId, filteredTopics.map((topic) => topic.id)),
    [filteredTopics, selectedTopicId],
  );

  useEffect(() => {
    if (activeTopicId !== selectedTopicId) {
      setSelectedTopicId(activeTopicId);
    }
  }, [activeTopicId, selectedTopicId]);

  const article = HELP_ARTICLES[activeTopicId] ?? HELP_ARTICLES["getting-started"];

  function handleSupportAction(action: "feedback" | "issue" | "diagnostics") {
    if (action === "diagnostics") {
      navigate("/help/diagnostics");
      return;
    }
    if (action === "feedback") {
      setShowSendFeedbackModal(true);
      return;
    }
    if (action === "issue") {
      setShowReportIssueModal(true);
    }
  }

  function handleSubmitFeedback(payload: SendFeedbackPayload) {
    void (async () => {
      if (!window.bukolabs?.help) {
        setShowSendFeedbackModal(false);
        setShowFeedbackSubmittedModal(true);
        return;
      }

      const result = await window.bukolabs.help.submitConcern({
        concernType: "feedback",
        category: payload.feedbackType,
        subject: "User Feedback",
        message: payload.message,
        email: payload.email || profileEmail || undefined,
        rating: payload.rating,
      });

      setShowSendFeedbackModal(false);
      if (result.success) {
        setSubmitError(null);
        setShowFeedbackSubmittedModal(true);
      } else {
        setSubmitError(result.error ?? "Could not submit feedback. Sign in while online and try again.");
      }
    })();
  }

  function handleSubmitIssue(payload: ReportIssuePayload) {
    void (async () => {
      if (!window.bukolabs?.help) {
        setShowReportIssueModal(false);
        setShowReportSubmittedModal(true);
        return;
      }

      const categoryLabel =
        ISSUE_CATEGORIES.find((item) => item.id === payload.category)?.label ?? payload.category;

      const result = await window.bukolabs.help.submitConcern({
        concernType: "issue",
        category: categoryLabel,
        subject: categoryLabel,
        message: payload.description,
      });

      setShowReportIssueModal(false);
      if (result.success) {
        setSubmitError(null);
        setShowReportSubmittedModal(true);
      } else {
        setSubmitError(result.error ?? "Could not submit issue report. Sign in while online and try again.");
      }
    })();
  }

  useEffect(() => {
    if (!window.bukolabs?.help) return;

    void window.bukolabs.help.listTickets({ userId: session.userId ?? undefined }).then((result) => {
      if (result.success && result.data) {
        const unread = result.data.filter((ticket) => ticket.adminReply && ticket.replyRead === false).length;
        setTicketUnreadCount(unread);
      }
    });
  }, [session.userId]);

  function handleTopicSelect(topicId: string) {
    setSelectedTopicId(topicId);
    setFeedback(null);
  }

  function handleViewAllTopics() {
    setShowAllTopics((current) => !current);
  }

  return (
    <div className="help-assistant-page console-page" data-screen="section-09-help-assistant">
      <ConsolePageHeader
        title={getConsolePageTitle("Help Assistant")}
        subtitle={getConsolePageSubtitle("Help Assistant")}
        actions={
          <div className="help-assistant-page__header-actions">
            <div className="help-assistant-page__search-wrap">
              <Search
                className="help-assistant-page__search-icon"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <input
                type="search"
                className="help-assistant-page__search"
                placeholder="Search help..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowAllTopics(false);
                }}
                aria-label="Search help"
              />
            </div>
            <UserHelpTicketsButton unreadCount={ticketUnreadCount} onClick={() => setTicketsOpen(true)} />
          </div>
        }
      />

      {submitError ? (
        <div className="help-assistant-page__submit-error-wrap">
          <AppErrorState variant="error" title="Submission Failed" message={submitError} compact />
        </div>
      ) : null}

      <div className="help-assistant-page__content console-page__body">
        <div className="help-assistant-page__layout">
          <aside className="help-assistant-card help-assistant-card--topics">
            <h2 className="help-assistant-card__title">Quick Topics</h2>
            <ul className="help-assistant-topics">
              {visibleTopics.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    className={`help-assistant-topics__item${
                      activeTopicId === topic.id ? " help-assistant-topics__item--active" : ""
                    }`}
                    onClick={() => handleTopicSelect(topic.id)}
                  >
                    {topic.label}
                  </button>
                </li>
              ))}
            </ul>
            {canToggleAllTopics ? (
              <button
                type="button"
                className="help-assistant-btn help-assistant-btn--outline help-assistant-btn--block"
                onClick={handleViewAllTopics}
              >
                {showAllTopics ? "Show Fewer Topics" : "View All Topics"}
              </button>
            ) : null}
          </aside>

          <section className="help-assistant-card help-assistant-card--article">
            <div className="help-assistant-article__body">
              <h2 className="help-assistant-article__title">{article.title}</h2>
              <p className="help-assistant-article__intro">{article.intro}</p>

              {article.steps.length > 0 ? (
                <ol className="help-assistant-article__steps">
                  {article.steps.map((step, index) => (
                    <li key={`${activeTopicId}-step-${index + 1}`}>{step}</li>
                  ))}
                </ol>
              ) : null}

              {article.sections?.map((section) => (
                <div key={section.title} className="help-assistant-article__section">
                  <h3 className="help-assistant-article__section-title">{section.title}</h3>
                  <ol className="help-assistant-article__steps">
                    {section.steps.map((step, index) => (
                      <li key={`${section.title}-step-${index + 1}`}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div className="help-assistant-feedback">
              <span>Was this helpful?</span>
              <button
                type="button"
                className={`help-assistant-feedback__btn${feedback === "yes" ? " help-assistant-feedback__btn--active" : ""}`}
                onClick={() => setFeedback("yes")}
              >
                Yes
              </button>
              <span className="help-assistant-feedback__sep">·</span>
              <button
                type="button"
                className={`help-assistant-feedback__btn${feedback === "no" ? " help-assistant-feedback__btn--active" : ""}`}
                onClick={() => setFeedback("no")}
              >
                No
              </button>
            </div>
          </section>

          <aside className="help-assistant-card help-assistant-card--actions">
            <h2 className="help-assistant-card__title">Support Actions</h2>
            <div className="help-assistant-actions">
              <button
                type="button"
                className="help-assistant-btn help-assistant-btn--outline help-assistant-btn--block"
                onClick={() => handleSupportAction("feedback")}
              >
                Send Feedback
              </button>
              <button
                type="button"
                className="help-assistant-btn help-assistant-btn--outline help-assistant-btn--block"
                onClick={() => handleSupportAction("issue")}
              >
                Report an Issue
              </button>
              <button
                type="button"
                className="help-assistant-btn help-assistant-btn--outline help-assistant-btn--block"
                onClick={() => handleSupportAction("diagnostics")}
              >
                System Diagnostics
              </button>
            </div>
          </aside>
        </div>
      </div>

      <AppStatusBar
        variant="help-assistant-status-bar"
        lastItem={{
          icon: CloudOff,
          label: "Help topics not available offline",
        }}
      />

      {showSendFeedbackModal ? (
        <SendFeedbackModal
          defaultEmail={defaultFeedbackEmail}
          onCancel={() => setShowSendFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
        />
      ) : null}

      {showReportIssueModal ? (
        <ReportIssueModal
          onCancel={() => setShowReportIssueModal(false)}
          onSubmit={handleSubmitIssue}
        />
      ) : null}

      {showFeedbackSubmittedModal ? (
        <FeedbackSubmittedModal onDone={() => setShowFeedbackSubmittedModal(false)} />
      ) : null}

      {showReportSubmittedModal ? (
        <ReportSubmittedModal onDone={() => setShowReportSubmittedModal(false)} />
      ) : null}

      <UserHelpTicketsPanel
        open={ticketsOpen}
        onClose={() => setTicketsOpen(false)}
        onUnreadChange={setTicketUnreadCount}
      />
    </div>
  );
}
