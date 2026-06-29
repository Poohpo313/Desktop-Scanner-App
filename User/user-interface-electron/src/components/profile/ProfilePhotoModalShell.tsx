import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function ProfilePhotoModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  className = "",
}: Props) {
  return (
    <div className="profile-photo-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={`profile-photo-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-photo-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="profile-photo-modal__header">
          <div>
            <h2 id="profile-photo-modal-title" className="profile-photo-modal__title">
              {title}
            </h2>
            {subtitle ? <p className="profile-photo-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="profile-photo-modal__close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="profile-photo-modal__body">{children}</div>
        {footer ? <div className="profile-photo-modal__footer">{footer}</div> : null}
      </section>
    </div>
  );
}
