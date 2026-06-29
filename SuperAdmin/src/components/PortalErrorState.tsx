import { AlertCircle, AlertTriangle, Inbox, Info, type LucideIcon } from "lucide-react";

export type PortalErrorStateVariant = "error" | "warning" | "empty" | "info";

type PortalErrorStateProps = {
  variant?: PortalErrorStateVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  centered?: boolean;
  className?: string;
  role?: "alert" | "status" | "note";
};

const ICONS: Record<PortalErrorStateVariant, LucideIcon> = {
  error: AlertCircle,
  warning: AlertTriangle,
  empty: Inbox,
  info: Info,
};

export function PortalErrorState({
  variant = "error",
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  centered = false,
  className = "",
  role = variant === "info" ? "note" : "alert",
}: PortalErrorStateProps) {
  const Icon = ICONS[variant];

  return (
    <div
      className={`portal-error-state portal-error-state--${variant}${compact ? " portal-error-state--compact" : ""}${centered ? " portal-error-state--centered" : ""}${className ? ` ${className}` : ""}`}
      role={role}
    >
      <div className="portal-error-state__icon-wrap" aria-hidden="true">
        <Icon className="portal-error-state__icon" strokeWidth={1.8} />
      </div>
      <div className="portal-error-state__body">
        <h3 className="portal-error-state__title">{title}</h3>
        {message ? <p className="portal-error-state__message">{message}</p> : null}
        {actionLabel && onAction ? (
          <button type="button" className="portal-error-state__action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
