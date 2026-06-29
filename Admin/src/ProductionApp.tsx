import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import KeyManagementPage from "./pages/KeyManagementPage";
import DevicesPage from "./pages/DevicesPage";
import ProvisionDevicePage from "./pages/ProvisionDevicePage";
import HelpPage from "./pages/HelpPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import NotificationsCenterPage from "./pages/NotificationsCenterPage";
import AdministratorRecoverAccessPage from "./pages/AdministratorRecoverAccessPage";
import EmailRecoveryConfirmationPage from "./pages/EmailRecoveryConfirmationPage";
import SmsRecoveryConfirmationPage from "./pages/SmsRecoveryConfirmationPage";
import { PORTAL } from "./routes/portalPaths";

export default function ProductionApp() {
  return (
    <Routes>
      <Route path="/portal" element={<Navigate to={PORTAL.splash} replace />} />
      <Route path={PORTAL.splash} element={<SplashPage />} />
      <Route path={PORTAL.login} element={<LoginPage />} />
      <Route path={PORTAL.recoverAccess} element={<AdministratorRecoverAccessPage />} />
      <Route path={PORTAL.recoverEmailConfirmation} element={<EmailRecoveryConfirmationPage />} />
      <Route path={PORTAL.recoverSmsConfirmation} element={<SmsRecoveryConfirmationPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={PORTAL.dashboard} element={<DashboardPage />} />
        <Route path={PORTAL.users} element={<UserManagementPage />} />
        <Route path={`${PORTAL.users}/:userId`} element={<UserDetailsPage />} />
        <Route path={PORTAL.keys} element={<KeyManagementPage />} />
        <Route path={PORTAL.devices} element={<DevicesPage />} />
        <Route path={PORTAL.provisionDevice} element={<ProvisionDevicePage />} />
        <Route path={PORTAL.reports} element={<ReportsPage />} />
        <Route path={PORTAL.activityLogs} element={<ActivityLogsPage />} />
        <Route path={PORTAL.notifications} element={<NotificationsCenterPage />} />
        <Route path={PORTAL.help} element={<HelpPage />} />
        <Route path={PORTAL.settings} element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to={PORTAL.splash} replace />} />
    </Routes>
  );
}
