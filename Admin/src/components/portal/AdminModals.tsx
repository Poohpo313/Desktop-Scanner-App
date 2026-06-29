import { Link } from "react-router-dom";
import FigmaModal from "./FigmaModal";
import RegisterUserModal from "./RegisterUserModal";
import ReviewUserRegistrationModal from "./ReviewUserRegistrationModal";
import CreatingUserAccountModal from "./CreatingUserAccountModal";
import UserRegisteredSuccessModal from "./UserRegisteredSuccessModal";
import GenerateKeysSuccessModal from "./GenerateKeysSuccessModal";
import GenerateLicenseKeysModal from "./GenerateLicenseKeysModal";
import ViewDevicesModal from "./ViewDevicesModal";
import ProvideAssistanceModal from "./ProvideAssistanceModal";
import ActivityLogsModal from "./ActivityLogsModal";
import ViewLicenseModal from "./ViewLicenseModal";
import DeactivateKeyModal from "./DeactivateKeyModal";
import RevokeKeyModal from "./RevokeKeyModal";
import ExportLicenseDataModal from "./ExportLicenseDataModal";
import ProvisionDeviceBody from "./ProvisionDeviceBody";
import CheckDeviceStatusModal from "./CheckDeviceStatusModal";
import MonitorDeviceModal from "./MonitorDeviceModal";
import NotifySuperAdminModal from "./NotifySuperAdminModal";
import RetryConnectionModal from "./RetryConnectionModal";
import ReportIssueModal from "./ReportIssueModal";
import SecurityIncidentDetailsModal from "./SecurityIncidentDetailsModal";

type ModalProps = { closeTo?: string; confirmTo?: string };

export {
  RegisterUserModal,
  ReviewUserRegistrationModal,
  CreatingUserAccountModal,
  UserRegisteredSuccessModal,
  GenerateKeysSuccessModal,
  GenerateLicenseKeysModal,
  ViewDevicesModal,
  ProvideAssistanceModal,
  ActivityLogsModal,
  ViewLicenseModal,
  DeactivateKeyModal,
  RevokeKeyModal,
  ExportLicenseDataModal,
  ProvisionDeviceBody,
  CheckDeviceStatusModal,
  MonitorDeviceModal,
  NotifySuperAdminModal,
  RetryConnectionModal,
  ReportIssueModal,
  SecurityIncidentDetailsModal,
};

export function GenerateKeysModal({ closeTo = "/license-key-management-2226-2536", confirmTo = "/admin-dashboard-generate-keys" }: ModalProps) {
  return <GenerateLicenseKeysModal closeTo={closeTo} confirmTo={confirmTo} />;
}

export function ConfirmActionModal({ title, message, closeTo, confirmTo, confirmLabel = "Confirm" }: ModalProps & { title: string; message: string; confirmLabel?: string }) {
  return (
    <FigmaModal title={title} onClose={closeTo} footer={<><Link to={closeTo!} className="figma-btn figma-btn--ghost">Cancel</Link><Link to={confirmTo!} className="figma-btn figma-btn--primary">{confirmLabel}</Link></>}>
      <p className="text-body-muted">{message}</p>
    </FigmaModal>
  );
}



export function DeviceActionModal({ title, message, closeTo, confirmTo }: { title: string; message: string; closeTo: string; confirmTo: string }) {
  return <ConfirmActionModal title={title} message={message} closeTo={closeTo} confirmTo={confirmTo} />;
}
export function ContactCustomerModal({ closeTo = "/help-and-support-center-2226-2276" }: ModalProps) {
  return (
    <FigmaModal title="Contact Customer" onClose={closeTo} footer={<><Link to={closeTo} className="figma-btn figma-btn--ghost">Cancel</Link><Link to={closeTo} className="figma-btn figma-btn--primary">Send Message</Link></>}>
      <div className="recovery-field"><label className="recovery-field__label">Customer</label><input className="recovery-field__input" defaultValue="" readOnly /></div>
      <div className="recovery-field"><label className="recovery-field__label">Message</label><textarea className="recovery-field__input" rows={4} defaultValue="" style={{ height: "auto", padding: "12px 0" }} /></div>
    </FigmaModal>
  );
}

export function EscalateToSuperAdminModal({ closeTo = "/help-and-support-center-2226-2276" }: ModalProps) {
  return (
    <ConfirmActionModal title="Escalate to Super Admin" message="This ticket will be escalated to the Super Administrator for priority handling. The customer will be notified." closeTo={closeTo} confirmTo={closeTo} confirmLabel="Escalate" />
  );
}

export function MarkAsResolvedModal({ closeTo = "/help-and-support-center-2226-2276" }: ModalProps) {
  return (
    <ConfirmActionModal title="Mark as Resolved" message="This ticket will be closed and marked as resolved. The customer will receive a confirmation email." closeTo={closeTo} confirmTo={closeTo} confirmLabel="Mark Resolved" />
  );
}

