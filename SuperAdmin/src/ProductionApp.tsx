import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import LoginPage from "./pages/LoginPage";
import RecoverAdmin from "./pages/RecoverAdmin";
import EmailConfirmation from "./pages/EmailConfirmation";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import KeyManagementPage from "./pages/KeyManagementPage";
import DeviceManagerPage from "./pages/DeviceManagerPage";
import HelpPage from "./pages/HelpPage";
import SettingsPage from "./pages/SettingsPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import CloudStoragePage from "./pages/CloudStoragePage";
import BackupPage from "./pages/BackupPage";
import RoleManagementPage from "./pages/RoleManagementPage";
import SystemConfigPage from "./pages/SystemConfigPage";
import RecycleBinPage from "./pages/RecycleBinPage";

export default function ProductionApp() {
  return (
    <Routes>
      <Route path="/portal/login" element={<LoginPage />} />
      <Route path="/portal/recover-admin" element={<RecoverAdmin />} />
      <Route path="/portal/email-confirmation" element={<EmailConfirmation />} />
      <Route
        element={
          <ProtectedRoute>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        
        <Route path="/portal/dashboard" element={<DashboardPage />} />
        <Route path="/portal/admins" element={<AdminManagementPage />} />
        <Route path="/portal/users" element={<DeviceManagerPage />} />
        <Route path="/portal/devices" element={<Navigate to="/portal/users" replace />} />
        <Route path="/portal/user-accounts" element={<UserManagementPage />} />
        <Route path="/portal/keys" element={<KeyManagementPage />} />
        <Route path="/portal/cloud" element={<CloudStoragePage />} />
        <Route path="/portal/logs" element={<BackupPage />} />
        <Route path="/portal/backup" element={<Navigate to="/portal/logs" replace />} />
        <Route path="/portal/roles" element={<RoleManagementPage />} />
        <Route path="/portal/config" element={<SystemConfigPage />} />
        <Route path="/portal/recycle-bin" element={<RecycleBinPage />} />
        <Route path="/portal/settings" element={<SettingsPage />} />
        <Route path="/portal/help" element={<HelpPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/portal/login" replace />} />
    </Routes>
  );
}
