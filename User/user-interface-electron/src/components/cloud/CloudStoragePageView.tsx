import { Cloud, CloudOff, HardDrive } from "lucide-react";
import { ConsolePageHeader } from "../layout/ConsolePageHeader";
import { getConsolePageSubtitle, getConsolePageTitle } from "../layout/consolePageMeta";
import "../../styles/cloud-storage-page.css";

export function CloudStoragePageView() {
  return (
    <div className="cloud-storage-page console-page" data-screen="section-cloud-storage">
      <ConsolePageHeader
        title={getConsolePageTitle("Cloud")}
        subtitle="Cloud storage is planned for a future release. Your scans stay on this device for now."
      />

      <div className="cloud-storage-page__content console-page__body">
        <section className="cloud-storage-card cloud-storage-card--hero">
          <div className="cloud-storage-card__icon-wrap" aria-hidden="true">
            <Cloud className="cloud-storage-card__icon" strokeWidth={1.8} />
          </div>
          <h2 className="cloud-storage-card__title">Cloud storage coming soon</h2>
          <p className="cloud-storage-card__text">
            We are still planning the cloud provider, sync rules, and backup policy. Until then,
            all documents are saved locally in your Desktop Scanner Documents folder.
          </p>
        </section>

        <div className="cloud-storage-page__grid">
          <section className="cloud-storage-card">
            <HardDrive className="cloud-storage-card__list-icon" strokeWidth={1.8} />
            <h3>What works today</h3>
            <ul className="cloud-storage-card__list">
              <li>Local scanning and import</li>
              <li>Folder organization on this PC</li>
              <li>OCR search across saved files</li>
              <li>Optional gateway connection for admin features</li>
            </ul>
          </section>

          <section className="cloud-storage-card cloud-storage-card--muted">
            <CloudOff className="cloud-storage-card__list-icon" strokeWidth={1.8} />
            <h3>Planned for cloud</h3>
            <ul className="cloud-storage-card__list">
              <li>Automatic backup to cloud storage</li>
              <li>Sync across office devices</li>
              <li>Shared department folders online</li>
              <li>Cloud usage and quota dashboard</li>
            </ul>
          </section>
        </div>

        <p className="cloud-storage-page__note">
          Cloud Sync toggles in Settings will become available once your organization enables cloud
          storage. No action is required on your device right now.
        </p>
      </div>
    </div>
  );
}
