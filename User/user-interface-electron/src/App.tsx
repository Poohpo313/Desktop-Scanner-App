import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import AccountActivatedPage from "./pages/AccountActivatedPage";
import ActivationPage from "./pages/ActivationPage";
import CheckingConnectionPage from "./pages/CheckingConnectionPage";
import CheckingCredentialsPage from "./pages/CheckingCredentialsPage";
import CloudPage from "./pages/CloudPage";
import HelpAssistantPage from "./pages/HelpAssistantPage";
import ConnectionCheckPage from "./pages/ConnectionCheckPage";
import DashboardPage from "./pages/DashboardPage";
import DevicesPage from "./pages/DevicesPage";
import FigmaGalleryPage from "./pages/FigmaGalleryPage";
import FigmaScreenPage from "./pages/FigmaScreenPage";
import FilesPage from "./pages/FilesPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HelpPage from "./pages/HelpPage";
import SystemDiagnosticsPage from "./pages/SystemDiagnosticsPage";
import LoginPage from "./pages/LoginPage";
import NeedAccountAccessPage from "./pages/NeedAccountAccessPage";
import NoInternetPage from "./pages/NoInternetPage";
import OfflineDashboardPage from "./pages/OfflineDashboardPage";
import PrintPage from "./pages/PrintPage";
import PrintSettingsPage from "./pages/PrintSettingsPage";
import ConfirmPrintJobPage from "./pages/ConfirmPrintJobPage";
import PrintCompletedPage from "./pages/PrintCompletedPage";
import ReportsPage from "./pages/ReportsPage";
import RequestEmailPage from "./pages/RequestEmailPage";
import RequestSentPage from "./pages/RequestSentPage";
import RequestSmsPage from "./pages/RequestSmsPage";
import ScanPage from "./pages/ScanPage";
import SearchPage from "./pages/SearchPage";
import SavePreferencesPage from "./pages/SavePreferencesPage";
import SettingsPage from "./pages/SettingsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import SplashPage from "./pages/SplashPage";
import ValidatingSerialKeyPage from "./pages/ValidatingSerialKeyPage";
import WelcomePage from "./pages/WelcomePage";
import flow from "./flow.json";
import "./styles/auth-flow.css";

function ProductionApp() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/request-email" element={<RequestEmailPage />} />
      <Route path="/request-sms" element={<RequestSmsPage />} />
      <Route path="/request-sent" element={<RequestSentPage />} />
      <Route path="/need-account-access" element={<NeedAccountAccessPage />} />
      <Route path="/checking" element={<CheckingCredentialsPage />} />
      <Route path="/activate" element={<ActivationPage />} />
      <Route path="/validating-key" element={<ValidatingSerialKeyPage />} />
      <Route path="/activated" element={<AccountActivatedPage />} />
      <Route path="/checking-connection" element={<CheckingConnectionPage />} />
      <Route path="/connection-check" element={<ConnectionCheckPage />} />
      <Route path="/no-internet" element={<NoInternetPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/offline-dashboard" element={<OfflineDashboardPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/print" element={<PrintPage />} />
        <Route path="/print/settings" element={<PrintSettingsPage />} />
        <Route path="/print/confirm" element={<ConfirmPrintJobPage />} />
        <Route path="/print/completed" element={<PrintCompletedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/account" element={<AccountSettingsPage />} />
        <Route path="/settings/save-preferences" element={<SavePreferencesPage />} />
        <Route path="/cloud" element={<CloudPage />} />
        <Route path="/help-assistant" element={<HelpAssistantPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/diagnostics" element={<SystemDiagnosticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function FigmaApp() {
  return (
    <Routes>
      <Route path="/figma/gallery" element={<FigmaGalleryPage />} />
      <Route path="/figma/:slug" element={<FigmaScreenPage />} />
      <Route path="/figma" element={<Navigate to={`/figma/${flow.entry}`} replace />} />
      <Route path="*" element={<Navigate to="/figma/gallery" replace />} />
    </Routes>
  );
}

export default function App() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/figma")) return <FigmaApp />;
  return <ProductionApp />;
}
