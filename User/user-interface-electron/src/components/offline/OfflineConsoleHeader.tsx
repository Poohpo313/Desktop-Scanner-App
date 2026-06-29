import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { OfflineConsoleBreadcrumbItem } from "./offlineConsoleTitles";

type OfflineConsoleHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumb?: OfflineConsoleBreadcrumbItem[];
  badges?: ReactNode;
  actions?: ReactNode;
};

export function OfflineConsoleHeader({
  title,
  subtitle,
  breadcrumb,
  badges,
  actions,
}: OfflineConsoleHeaderProps) {
  const hasTrailing = Boolean(badges || actions);

  return (
    <header
      className={`offline-console-header${
        hasTrailing ? " offline-console-header--with-badges" : ""
      }${breadcrumb ? " offline-console-header--with-breadcrumb" : ""}`}
    >
      <div className="offline-console-header__copy">
        <h1 className="offline-console-header__title">{title}</h1>
        {breadcrumb ? (
          <nav className="offline-console-header__breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((item, index) => (
              <span key={`${item.label}-${index}`} className="offline-console-header__breadcrumb-part">
                {index > 0 ? (
                  <span className="offline-console-header__breadcrumb-sep" aria-hidden="true">
                    &gt;
                  </span>
                ) : null}
                <span
                  className={
                    item.active
                      ? "offline-console-header__breadcrumb-current"
                      : "offline-console-header__breadcrumb-link"
                  }
                >
                  {item.label}
                </span>
              </span>
            ))}
          </nav>
        ) : subtitle ? (
          <p className="offline-console-header__subtitle">{subtitle}</p>
        ) : null}
      </div>
      {badges ? <div className="offline-console-header__badges">{badges}</div> : null}
      {actions ? <div className="offline-console-header__actions">{actions}</div> : null}
    </header>
  );
}

export type OfflineStatusBarLastItem = {
  icon: LucideIcon;
  label: string;
};
