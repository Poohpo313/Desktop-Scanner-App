import { Navigate, Route, Routes } from "react-router-dom";
import AdminSplashScreen from "./screens/admin-splash";
import AdminLoginScreen from "./screens/admin-login";
import AdminRecoverAccessScreen from "./screens/admin-recover-access";
import AdminEmailRecoveryConfirmationScreen from "./screens/admin-email-recovery-confirmation";
import AdminSmsRecoveryConfirmationScreen from "./screens/admin-sms-recovery-confirmation";
import AdminDashboardScreen from "./screens/admin-dashboard";
import AdminDashboardGenerateKeysScreen from "./screens/admin-dashboard-generate-keys";
import AdminDashboardUserRegisterModalScreen from "./screens/admin-dashboard-user-register-modal";
import AdminDashboardViewDevicesScreen from "./screens/admin-dashboard-view-devices";
import AdminDashboardProvideAssistanceScreen from "./screens/admin-dashboard-provide-assistance";
import AdminDashboardInvestigateSecurityScreen from "./screens/admin-dashboard-investigate-security";
import AdminDashboardActivityLogsScreen from "./screens/admin-dashboard-activity-logs";
import AdminDashboardNotificationsCenterScreen from "./screens/admin-dashboard-notifications-center";
import SuccessModalCanvasScreen from "./screens/success-modal-canvas";
import ContactCustomerModalScreen from "./screens/contact-customer-modal";
import HelpAndSupportCenterScreen from "./screens/help-and-support-center";
import HelpAndSupportCenter22125437Screen from "./screens/help-and-support-center-2212-5437";
import EscalateToSuperAdminModalScreen from "./screens/escalate-to-super-admin-modal";
import MarkAsResolvedModalScreen from "./screens/mark-as-resolved-modal";
import ProvideAssistanceModalScreen from "./screens/provide-assistance-modal";
import CheckDeviceStatusModalScreen from "./screens/check-device-status-modal";
import NotifySuperAdminModalScreen from "./screens/notify-super-admin-modal";
import MonitorDeviceModalScreen from "./screens/monitor-device-modal";
import RetryConnectionModalScreen from "./screens/retry-connection-modal";
import ReportIssueModalScreen from "./screens/report-issue-modal";
import LicenseKeyManagementScreen from "./screens/license-key-management";
import RevokeKeyModalScreen from "./screens/revoke-key-modal";
import DeactivateKeyModalScreen from "./screens/deactivate-key-modal";
import ViewLicenseModalScreen from "./screens/view-license-modal";
import GenerateKeysModalScreen from "./screens/generate-keys-modal";
import UserManagementScreen from "./screens/user-management";
import UserManagement221210573Screen from "./screens/user-management-2212-10573";
import ProvisionDeviceScreen from "./screens/provision-device";
import AdminDashboard22261193Screen from "./screens/admin-dashboard-2226-1193";
import DeviceManagementScreen from "./screens/device-management";
import SettingsScreen from "./screens/settings";
import UserManagement22261953Screen from "./screens/user-management-2226-1953";
import HelpAndSupportCenter22262276Screen from "./screens/help-and-support-center-2226-2276";
import LicenseKeyManagement22262536Screen from "./screens/license-key-management-2226-2536";
import UserManagementUserRegisterModalScreen from "./screens/user-management-user-register-modal";
import UserManagementUserDetailsScreen from "./screens/user-management-user-details";
import UserManagementEditUserModalScreen from "./screens/user-management-edit-user-modal";

export default function FigmaApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin-splash" replace />} />
      <Route path="/admin-splash" element={<AdminSplashScreen />} />
      <Route path="/admin-login" element={<AdminLoginScreen />} />
      <Route path="/admin-recover-access" element={<AdminRecoverAccessScreen />} />
      <Route path="/admin-email-recovery-confirmation" element={<AdminEmailRecoveryConfirmationScreen />} />
      <Route path="/admin-sms-recovery-confirmation" element={<AdminSmsRecoveryConfirmationScreen />} />
      <Route path="/admin-dashboard" element={<AdminDashboardScreen />} />
      <Route path="/admin-dashboard-generate-keys" element={<AdminDashboardGenerateKeysScreen />} />
      <Route path="/admin-dashboard-user-register-modal" element={<AdminDashboardUserRegisterModalScreen />} />
      <Route path="/admin-dashboard-view-devices" element={<AdminDashboardViewDevicesScreen />} />
      <Route path="/admin-dashboard-provide-assistance" element={<AdminDashboardProvideAssistanceScreen />} />
      <Route path="/admin-dashboard-investigate-security" element={<AdminDashboardInvestigateSecurityScreen />} />
      <Route path="/admin-dashboard-activity-logs" element={<AdminDashboardActivityLogsScreen />} />
      <Route path="/admin-dashboard-notifications-center" element={<AdminDashboardNotificationsCenterScreen />} />
      <Route path="/success-modal-canvas" element={<SuccessModalCanvasScreen />} />
      <Route path="/contact-customer-modal" element={<ContactCustomerModalScreen />} />
      <Route path="/help-and-support-center" element={<HelpAndSupportCenterScreen />} />
      <Route path="/help-and-support-center-2212-5437" element={<HelpAndSupportCenter22125437Screen />} />
      <Route path="/escalate-to-super-admin-modal" element={<EscalateToSuperAdminModalScreen />} />
      <Route path="/mark-as-resolved-modal" element={<MarkAsResolvedModalScreen />} />
      <Route path="/provide-assistance-modal" element={<ProvideAssistanceModalScreen />} />
      <Route path="/check-device-status-modal" element={<CheckDeviceStatusModalScreen />} />
      <Route path="/notify-super-admin-modal" element={<NotifySuperAdminModalScreen />} />
      <Route path="/monitor-device-modal" element={<MonitorDeviceModalScreen />} />
      <Route path="/retry-connection-modal" element={<RetryConnectionModalScreen />} />
      <Route path="/report-issue-modal" element={<ReportIssueModalScreen />} />
      <Route path="/license-key-management" element={<LicenseKeyManagementScreen />} />
      <Route path="/revoke-key-modal" element={<RevokeKeyModalScreen />} />
      <Route path="/deactivate-key-modal" element={<DeactivateKeyModalScreen />} />
      <Route path="/view-license-modal" element={<ViewLicenseModalScreen />} />
      <Route path="/generate-keys-modal" element={<GenerateKeysModalScreen />} />
      <Route path="/user-management" element={<UserManagementScreen />} />
      <Route path="/user-management-2212-10573" element={<UserManagement221210573Screen />} />
      <Route path="/provision-device" element={<ProvisionDeviceScreen />} />
      <Route path="/admin-dashboard-2226-1193" element={<AdminDashboard22261193Screen />} />
      <Route path="/device-management" element={<DeviceManagementScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/user-management-2226-1953" element={<UserManagement22261953Screen />} />
      <Route path="/help-and-support-center-2226-2276" element={<HelpAndSupportCenter22262276Screen />} />
      <Route path="/license-key-management-2226-2536" element={<LicenseKeyManagement22262536Screen />} />
      <Route path="/user-management-user-register-modal" element={<UserManagementUserRegisterModalScreen />} />
      <Route path="/user-management-user-details" element={<Navigate to="/user-management-user-details/1" replace />} />
      <Route path="/user-management-user-details/:userId" element={<UserManagementUserDetailsScreen />} />
      <Route path="/user-management-edit-user-modal" element={<UserManagementEditUserModalScreen />} />
    </Routes>
  );
}
