import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: string;
  onDismiss?: () => void;
  wide?: boolean;
  success?: boolean;
  hideHeader?: boolean;
  hideClose?: boolean;
  closeIcon?: ReactNode;
  headerIcon?: ReactNode;
  className?: string;
  footerClassName?: string;
};

export default function FigmaModal({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  onClose,
  onDismiss,
  wide,
  success,
  hideHeader,
  hideClose,
  closeIcon,
  headerIcon,
  className,
  footerClassName,
}: Props) {
  const showClose = !hideClose && (onDismiss ?? onClose);

  return (
    <div
      className={`figma-modal${wide ? " figma-modal--wide" : ""}${success ? " figma-modal--success" : ""}${className ? ` ${className}` : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "figma-modal-title" : undefined}
    >
      {!hideHeader && (title || showClose) && (
        <div className="figma-modal__header">
          <div>
            {eyebrow && <p className="figma-modal__eyebrow">{eyebrow}</p>}
            {title && (
              <h2 id="figma-modal-title" className="figma-modal__title">
                {headerIcon && <span className="figma-modal__header-icon">{headerIcon}</span>}
                {title}
              </h2>
            )}
            {subtitle && <p className="figma-modal__subtitle">{subtitle}</p>}
          </div>
          {showClose &&
            (onDismiss ? (
              <button type="button" className="figma-modal__close" aria-label="Close" onClick={onDismiss}>
                {closeIcon ?? "×"}
              </button>
            ) : (
              <Link to={onClose!} className="figma-modal__close" aria-label="Close">
                {closeIcon ?? "×"}
              </Link>
            ))}
        </div>
      )}
      <div className="figma-modal__body">{children}</div>
      {footer && (
        <div className={`figma-modal__footer${footerClassName ? ` ${footerClassName}` : ""}`}>{footer}</div>
      )}
    </div>
  );
}
