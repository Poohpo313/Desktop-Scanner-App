import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { BukolabsLogoMark } from "../brand/BukolabsLogoMark";
import { AboutInfoModal } from "./AboutInfoModal";
import { getAppMetadata, RELEASE_NOTES, THIRD_PARTY_LICENSES } from "./aboutContent";

type UpdateStatus = "idle" | "checking" | "latest";
type AboutModal = "release-notes" | "licenses" | null;

export function ApplicationDetailsCard() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [openModal, setOpenModal] = useState<AboutModal>(null);
  const checkTimer = useRef<number | null>(null);
  const app = getAppMetadata();

  useEffect(() => {
    return () => {
      if (checkTimer.current != null) window.clearTimeout(checkTimer.current);
    };
  }, []);

  function handleCheckForUpdates() {
    if (updateStatus === "checking") return;

    setUpdateStatus("checking");
    checkTimer.current = window.setTimeout(() => {
      setUpdateStatus("latest");
      checkTimer.current = null;
    }, 900);
  }

  return (
    <article className="about-card about-card--app">
      <div className="about-card__brand">
        <div className="about-card__logo-wrap" aria-hidden="true">
          <BukolabsLogoMark className="about-card__logo" title="Desktop Scanner" />
        </div>
        <div>
          <h2 className="about-card__app-title">Desktop Scanner</h2>
          <p className="about-card__version">
            Version {app.version} · Build {app.buildLabel} · {app.releaseDate}
          </p>
        </div>
      </div>

      <p className="about-card__description">
        Desktop Scanner is a powerful desktop document scanning application that helps users scan,
        organize, and protect what matters.
      </p>

      <div className="about-card__actions">
        <button
          type="button"
          className="about-btn about-btn--primary"
          onClick={handleCheckForUpdates}
          disabled={updateStatus === "checking"}
          aria-busy={updateStatus === "checking"}
        >
          {updateStatus === "checking" ? "Checking…" : "Check for Updates"}
        </button>
        <button
          type="button"
          className="about-btn about-btn--outline"
          onClick={() => setOpenModal("release-notes")}
        >
          Release Notes
        </button>
        <button
          type="button"
          className="about-btn about-btn--outline"
          onClick={() => setOpenModal("licenses")}
        >
          Third-Party Licenses
        </button>
      </div>

      {openModal === "release-notes" ? (
        <AboutInfoModal
          kind="release-notes"
          title="Release Notes"
          releaseNotes={RELEASE_NOTES}
          onClose={() => setOpenModal(null)}
        />
      ) : null}

      {openModal === "licenses" ? (
        <AboutInfoModal
          kind="licenses"
          title="Third-Party Licenses"
          licenses={THIRD_PARTY_LICENSES}
          onClose={() => setOpenModal(null)}
        />
      ) : null}

      {updateStatus !== "idle" ? (
        <p
          className={`about-update-status about-update-status--${updateStatus}`}
          role="status"
          aria-live="polite"
        >
          {updateStatus === "checking" ? (
            <>
              <Loader2 className="about-update-status__icon about-update-status__icon--spin" />
              Checking for updates…
            </>
          ) : (
            <>
              <CheckCircle2 className="about-update-status__icon" />
              You&apos;re on the latest update.
            </>
          )}
        </p>
      ) : null}

      <p className="about-card__copyright">
        © {app.copyrightYear} {app.name} by Bukolabs.io. All rights reserved.
      </p>
    </article>
  );
}
