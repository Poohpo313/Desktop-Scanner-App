import { CloudOff } from "lucide-react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { FeatureCard } from "../components/dashboard/FeatureCard";
import { RecentFilesTable } from "../components/dashboard/RecentFilesTable";
import { ScanSettingsCard } from "../components/dashboard/ScanSettingsCard";
import { StatCard } from "../components/dashboard/StatCard";
import { OfflineSectionView } from "../components/offline";
import { useAppMode } from "../context/AppModeContext";
import { useDevices } from "../context/DevicesContext";
import { useDocuments } from "../context/DocumentsContext";
import { useSession } from "../context/SessionContext";
import {
  computeDashboardTrend,
  devicesConnectedTrend,
  emptyMetricTrend,
} from "../lib/dashboardStats";
import { formatStorageSize } from "../lib/documents";
import "../styles/dashboard.css";

const STORAGE_TOTAL_GB = 5;

function DashboardContent() {
  const { session } = useSession();
  const { documents, documentCount, pageCount, storageBytes } = useDocuments();
  const { devices } = useDevices();
  const isFreshWorkspace = session.freshWorkspace === true && documentCount === 0;
  const hasDocuments = documentCount > 0;
  const connectedDevices = devices.filter((device) => device.status === "connected").length;
  const storageProgress = Math.min(
    100,
    Math.round((storageBytes / (STORAGE_TOTAL_GB * 1024 * 1024 * 1024)) * 100),
  );

  const documentTrend = hasDocuments
    ? computeDashboardTrend(documents, () => 1)
    : emptyMetricTrend("No documents scanned yet");
  const pageTrend = hasDocuments
    ? computeDashboardTrend(documents, (doc) => doc.pages)
    : emptyMetricTrend("No pages scanned yet");
  const deviceTrend = devicesConnectedTrend(connectedDevices);

  return (
    <div className="dashboard console-page" data-screen="section-02-dashboard" data-figma-id="38:228">
      <DashboardHeader
        subtitle={
          isFreshWorkspace
            ? "Your workspace is ready. Start scanning to see activity here."
            : undefined
        }
      />

      <div className="console-page__body">
        <div className="dashboard__stats">
          {isFreshWorkspace ? (
            <>
              <StatCard
                label="Documents Scanned"
                value="0"
                trend="No documents scanned yet"
                trendDirection="neutral"
                to="/files"
              />
              <StatCard
                label="Pages Scanned"
                value="0"
                trend="No pages scanned yet"
                trendDirection="neutral"
                to="/files"
              />
              <StatCard
                label="Storage Used"
                value="0 MB"
                valueDetail={`of ${STORAGE_TOTAL_GB.toFixed(2)} GB`}
                progress={0}
              />
              <StatCard
                label="Devices Connected"
                value="0"
                trend="No devices connected yet"
                trendDirection="neutral"
              />
            </>
          ) : (
            <>
              <StatCard
                label="Documents Scanned"
                value={String(documentCount)}
                trend={documentTrend.label}
                trendDirection={documentTrend.direction}
                to="/files"
              />
              <StatCard
                label="Pages Scanned"
                value={String(pageCount)}
                trend={pageTrend.label}
                trendDirection={pageTrend.direction}
                to="/files"
              />
              <StatCard
                label="Storage Used"
                value={formatStorageSize(storageBytes)}
                valueDetail={`of ${STORAGE_TOTAL_GB.toFixed(2)} GB`}
                progress={storageProgress}
              />
              <StatCard
                label="Devices Connected"
                value={String(connectedDevices)}
                trend={deviceTrend.label}
                trendDirection={deviceTrend.direction}
              />
            </>
          )}
        </div>

        <div className="dashboard__grid">
          <RecentFilesTable />
          <ScanSettingsCard />
        </div>

        <div className="dashboard__features">
          <FeatureCard
            icon="lock"
            title="Private & Local Storage"
            description="All files remain on your device unless you choose cloud sync."
          />
          <FeatureCard
            icon="scan"
            title="High Quality Scanning"
            description="Capture detailed scans with OCR for searchable documents."
          />
          <FeatureCard
            iconNode={<CloudOff className="h-5 w-5 text-[#008768]" strokeWidth={1.8} />}
            title="Always Offline Ready"
            description="Continue working even without internet access."
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return <OfflineSectionView section="Dashboard" screenSlug="section-offline-dashboard" />;
  }

  return <DashboardContent />;
}
