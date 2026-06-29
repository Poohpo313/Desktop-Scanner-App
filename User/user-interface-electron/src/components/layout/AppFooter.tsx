import { useSession } from "../../context/SessionContext";

export function AppFooter() {
  const { session } = useSession();
  const initials = session.role ? session.role.slice(0, 2).toUpperCase() : "U";
  const displayName = session.role === "user" ? "John Doe" : (session.role ?? "User");
  const email = "john@company.com";

  return (
    <footer className="app-footer">
      <div className="app-footer__user">
        <div className="app-footer__avatar">{initials}</div>
        <span>
          <strong className="text-brand-deep font-medium">{displayName}</strong>
          <span className="mx-1.5 text-brand-border">—</span>
          {email}
          <span className="mx-1.5 text-brand-border">/</span>
          Admin Access
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="app-footer__secure">
          🔒 Secure &amp; Ready — Your workspace is protected and ready to scan
        </span>
        <span>© bukolabs.io Admin</span>
      </div>
    </footer>
  );
}
