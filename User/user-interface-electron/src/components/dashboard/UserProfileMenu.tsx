import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "../../context/AppModeContext";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import { useSession } from "../../context/SessionContext";
import { AccountMenu, AccountSummaryCard, OfflineAccountMenu } from "./account-menu";

function profileEmail(displayName: string): string {
  const slug = displayName.toLowerCase().replace(/\s+/g, ".");
  return `${slug}@bukolabs.io`;
}

function syncStatus(isOnline: boolean): string {
  return isOnline ? "Cloud Sync Enabled" : "Cloud Sync Disabled";
}

/** Sidebar profile trigger + Bukolabs account menu dropdown */
export function UserProfileMenu({
  compact = false,
  stacked = false,
}: {
  compact?: boolean;
  stacked?: boolean;
}) {
  const navigate = useNavigate();
  const { session, clearSession } = useSession();
  const { isOnline } = useAppMode();
  const { photoUrl } = useProfilePhoto(session.userId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const userName = session.displayName ?? "John Doe";
  const displayName = isOnline ? userName : "Offline Mode";
  const email = profileEmail(userName);
  const status = isOnline ? syncStatus(isOnline) : "Local scans only";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function logout() {
    if (session.token) {
      await window.bukolabs?.auth.logout({ token: session.token });
    }
    clearSession();
    navigate("/login", { replace: true });
  }

  function closeAndNavigate(path: string) {
    setOpen(false);
    navigate(path);
  }

  const closedSubtitle = compact ? status : isOnline ? email : status;

  return (
    <div ref={rootRef} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-3">
          {isOnline ? (
            <AccountMenu
              displayName={userName}
              initials={initials}
              photoUrl={photoUrl}
              status={status}
              onAccountSettings={() => closeAndNavigate("/settings/account")}
              onSavePreferences={() => closeAndNavigate("/settings/save-preferences")}
              onHelpAssistant={() => closeAndNavigate("/help-assistant")}
              onSignOut={logout}
            />
          ) : (
            <OfflineAccountMenu
              displayName={userName}
              initials={initials}
              photoUrl={photoUrl}
              onAccountSettings={() => closeAndNavigate("/settings/account")}
              onSignOut={logout}
            />
          )}
        </div>
      )}

      {open && !compact ? (
        <AccountSummaryCard
          displayName={displayName}
          initials={initials}
          photoUrl={photoUrl}
          status={status}
          open={open}
          onClick={() => setOpen(false)}
          stacked={stacked}
        />
      ) : (
        <AccountSummaryCard
          displayName={displayName}
          initials={initials}
          photoUrl={photoUrl}
          status={closedSubtitle}
          open={open}
          onClick={() => setOpen((v) => !v)}
          compact={compact}
          stacked={stacked}
        />
      )}
    </div>
  );
}
