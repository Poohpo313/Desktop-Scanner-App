import { useCallback, useState } from "react";
import AdminPortalPage from "./AdminPortalPage";
import AdminDashboardBody from "../AdminDashboardBody";
import PortalOverlay from "./PortalOverlay";
import RegisterUserModal from "./RegisterUserModal";
import GenerateLicenseKeysModal from "./GenerateLicenseKeysModal";
import ViewDevicesModal from "./ViewDevicesModal";
import ProvideAssistanceModal from "./ProvideAssistanceModal";
import SecurityIncidentDetailsModal from "./SecurityIncidentDetailsModal";
import { useDashboardRefreshStore } from "../../store/dashboardRefreshStore";
import { useNotificationStore } from "../../store/notificationStore";
import "../../styles/portal-modal.css";
import "../../styles/generate-license-keys-modal.css";
import "../../styles/generate-keys-success-modal.css";
import "../../styles/view-devices-modal.css";
import "../../styles/provide-assistance-modal.css";
import "../../styles/security-incident-details-modal.css";

type Crumb = { label: string; to?: string };

type Props = {
  figmaId: string;
  screen: string;
  breadcrumb?: Crumb[];
  homeHref?: string;
};

export default function AdminDashboardFigmaShell({
  figmaId,
  screen,
  breadcrumb = [{ label: "Home" }, { label: "Dashboard" }],
  homeHref = "/admin-dashboard-2226-1193",
}: Props) {
  const push = useNotificationStore((s) => s.push);
  const bumpDashboard = useDashboardRefreshStore((s) => s.bump);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [generateKeysOpen, setGenerateKeysOpen] = useState(false);
  const [viewDevicesOpen, setViewDevicesOpen] = useState(false);
  const [provideAssistanceOpen, setProvideAssistanceOpen] = useState(false);
  const [investigateSecurityOpen, setInvestigateSecurityOpen] = useState(false);
  const openGenerateKeysModal = useCallback(() => {
    setGenerateKeysOpen(true);
  }, []);

  const closeGenerateKeysModal = useCallback(() => {
    setGenerateKeysOpen(false);
  }, []);

  return (
    <AdminPortalPage
      figmaId={figmaId}
      screen={screen}
      breadcrumb={breadcrumb}
      homeHref={homeHref}
    >
      <AdminDashboardBody
        variant="figma"
        onRegisterUser={() => setRegisterOpen(true)}
        onGenerateKeys={openGenerateKeysModal}
        onViewDevices={() => setViewDevicesOpen(true)}
        onProvideAssistance={() => setProvideAssistanceOpen(true)}
        onInvestigateSecurity={() => setInvestigateSecurityOpen(true)}
      />

      <PortalOverlay open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <RegisterUserModal
          onClose={() => setRegisterOpen(false)}
          onDone={() => {
            push("User registered", "success");
            bumpDashboard();
            setRegisterOpen(false);
          }}
        />
      </PortalOverlay>

      <PortalOverlay open={generateKeysOpen} onClose={closeGenerateKeysModal}>
        <GenerateLicenseKeysModal
          onClose={closeGenerateKeysModal}
          onConfirm={() => {
            push("Serial key generated", "success");
            bumpDashboard();
            closeGenerateKeysModal();
          }}
        />
      </PortalOverlay>

      <PortalOverlay open={viewDevicesOpen} onClose={() => setViewDevicesOpen(false)}>
        <ViewDevicesModal
          onClose={() => setViewDevicesOpen(false)}
          onScanComplete={bumpDashboard}
        />
      </PortalOverlay>

      <PortalOverlay open={provideAssistanceOpen} onClose={() => setProvideAssistanceOpen(false)}>
        <ProvideAssistanceModal onClose={() => setProvideAssistanceOpen(false)} />
      </PortalOverlay>

      <PortalOverlay open={investigateSecurityOpen} onClose={() => setInvestigateSecurityOpen(false)}>
        <SecurityIncidentDetailsModal onClose={() => setInvestigateSecurityOpen(false)} />
      </PortalOverlay>
    </AdminPortalPage>
  );
}
