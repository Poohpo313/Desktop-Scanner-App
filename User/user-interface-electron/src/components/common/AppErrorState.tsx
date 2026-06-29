import { AlertCircle, AlertTriangle, Inbox, Info, type LucideIcon } from "lucide-react";

export type AppErrorStateVariant = "error" | "warning" | "empty" | "info";

type AppErrorStateProps = {
  variant?: AppErrorStateVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
  role?: "alert" | "status" | "note";
};

const ICONS: Record<AppErrorStateVariant, LucideIcon> = {
  error: AlertCircle,
  warning: AlertTriangle,
  empty: Inbox,
  info: Info,
};

export function AppErrorState({
  variant = "error",
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  className = "",
  role = variant === "info" ? "note" : "alert",
}: AppErrorStateProps) {
  const Icon = ICONS[variant];

  return (
    <div
      className={`app-error-state app-error-state--${variant}${compact ? " app-error-state--compact" : ""}${className ? ` ${className}` : ""}`}
      role={role}
    >
      <div className="app-error-state__icon-wrap" aria-hidden="true">
        <Icon className="app-error-state__icon" strokeWidth={1.8} />
      </div>
      <div className="app-error-state__body">
        <h3 className="app-error-state__title">{title}</h3>
        {message ? <p className="app-error-state__message">{message}</p> : null}
        {actionLabel && onAction ? (
          <button type="button" className="app-error-state__action scan-btn scan-btn--outline" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
