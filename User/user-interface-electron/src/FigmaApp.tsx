import { Navigate, Route, Routes } from "react-router-dom";
import flow from "./flow.json";
import FeedbackSubmittedScreen from "./screens/feedback-submitted";
import ReportSuccessfullyScreen from "./screens/report-successfully";
import ExportSuccessfullyScreen from "./screens/export-successfully";
import LogOutForOfflineUserAccountScreen from "./screens/log-out-for-offline-user-account";
import OfflineLocalSaveFolderScreen from "./screens/offline-local-save-folder";
import SectionScreen1SelectScannerOfflineScreen from "./screens/section-screen-1-select-scanner-offline";
import SectionScreen2ConfigureOfflineScreen from "./screens/section-screen-2-configure-offline";
import SectionScreen3PreviewOfflineScreen from "./screens/section-screen-3-preview-offline";
import SectionScreen4SaveOfflineScreen from "./screens/section-screen-4-save-offline";
import SectionOfflineAboutScreen from "./screens/section-offline-about";
import SectionOfflineDevicesScreen from "./screens/section-offline-devices";
import SectionOfflineSearchScreen from "./screens/section-offline-search";
import SectionOfflineDocumentsScreen from "./screens/section-offline-documents";
import SectionOfflineDashboardScreen from "./screens/section-offline-dashboard";
import SectionOfflineSettingsScreen from "./screens/section-offline-settings";
import S9DocumentPreviewOverlayScreen from "./screens/9-document-preview-overlay";
import S7MoveToFolderOverlayScreen from "./screens/7-move-to-folder-overlay";
import S6RenameFileOverlayScreen from "./screens/6-rename-file-overlay";
import S5SortOptionsOverlayScreen from "./screens/5-sort-options-overlay";
import S4FileTypeFilterOverlayScreen from "./screens/4-file-type-filter-overlay";
import S3DepartmentFilterOverlayScreen from "./screens/3-department-filter-overlay";
import S2ExportOptionsOverlayScreen from "./screens/2-export-options-overlay";
import S8PrintSettingsOverlayScreen from "./screens/8-print-settings-overlay";
import S1NewFolderOverlayScreen from "./screens/1-new-folder-overlay";
import S2PaperRoutingFolderRouteWithSubfoldersOverlayScreen from "./screens/2-paper-routing-folder-route-with-subfolders-overlay";
import S5ResolutionOverlayScreen from "./screens/5-resolution-overlay";
import S6ColorModeOverlayScreen from "./screens/6-color-mode-overlay";
import S3BrowseFolderOverlayScreen from "./screens/3-browse-folder-overlay";
import S4BondPaperSizeOverlayScreen from "./screens/4-bond-paper-size-overlay";
import OverlaySelectDepartmentScreen from "./screens/overlay-select-department";
import Section03ConfigureScreen from "./screens/section-03-configure";
import DocumentsSaveScreen from "./screens/documents-save";
import Section03PreviewScreen from "./screens/section-03-preview";
import Section03SaveScreen from "./screens/section-03-save";
import ChangesSavedScreen from "./screens/changes-saved";
import SavedScreen from "./screens/saved";
import SectionSendFeedbackScreen from "./screens/section-send-feedback";
import SectionAvailableDevicesScreen from "./screens/section-available-devices";
import Section10SavePreferencesScreen from "./screens/section-10-save-preferences";
import Section09HelpAssistantScreen from "./screens/section-09-help-assistant";
import SectionReportAnIssueScreen from "./screens/section-report-an-issue";
import Section08AboutScreen from "./screens/section-08-about";
import Section07SettingsScreen from "./screens/section-07-settings";
import Section06DevicesScreen from "./screens/section-06-devices";
import Section05SearchScreen from "./screens/section-05-search";
import Section04DocumentsScreen from "./screens/section-04-documents";
import Section03ScanScreen from "./screens/section-03-scan";
import Section02DashboardScreen from "./screens/section-02-dashboard";
import SectionAccountMenuScreen from "./screens/section-account-menu";
import S002SplashScreenScreen from "./screens/002-splash-screen";
import ForgotPasswordScreen from "./screens/forgot-password";
import Section12ActivateAccountScreen from "./screens/section-1-2-activate-account";
import Section11ReturningUserLoginScreen from "./screens/section-1-1-returning-user-login";
import NoInternetConnectionScreen from "./screens/no-internet-connection";
import CheckingCredentialsScreen from "./screens/checking-credentials";
import ValidatingSerialKeyScreen from "./screens/validating-serial-key";
import AccountActivatedScreen from "./screens/account-activated";
import CheckingConnectionScreen from "./screens/checking-connection";
import RequestSentSuccessfullyScreen from "./screens/request-sent-successfully";
import RequestThroughSmsScreen from "./screens/request-through-sms";
import RequestThroughEmailScreen from "./screens/request-through-email";
import NeedAccountAccessScreen from "./screens/need-account-access";
import PrintSavedDocumentScreen from "./screens/print-saved-document";
import ConfirmPrintJobScreen from "./screens/confirm-print-job";
import PrintCompletedScreen from "./screens/print-completed";
import RequestSentForForgotPasswordSuccessfullyScreen from "./screens/request-sent-for-forgot-password-successfully";

function AllScreensIndex() {
  return (
    <main className="screen-index min-h-screen bg-brand-bg p-8">
      <h1 className="text-2xl font-semibold text-brand-deep">User Interface — All Figma Screens</h1>
      <p className="text-sm text-gray-500 mt-2">{66} screens · Flow entry: /figma/{flow.entry}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/feedback-submitted"><strong>FEEDBACK SUBMITTED</strong><span className="block text-xs text-gray-400 mt-1">861:942</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/report-successfully"><strong>REPORT SUCCESSFULLY</strong><span className="block text-xs text-gray-400 mt-1">797:902</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/export-successfully"><strong>EXPORT SUCCESSFULLY</strong><span className="block text-xs text-gray-400 mt-1">797:801</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/log-out-for-offline-user-account"><strong>LOG OUT FOR OFFLINE USER ACCOUNT</strong><span className="block text-xs text-gray-400 mt-1">771:546</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/offline-local-save-folder"><strong>OFFLINE LOCAL SAVE FOLDER</strong><span className="block text-xs text-gray-400 mt-1">740:1908</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-screen-1-select-scanner-offline"><strong>Section - SCREEN 1: SELECT SCANNER OFFLINE</strong><span className="block text-xs text-gray-400 mt-1">732:850</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-screen-2-configure-offline"><strong>Section - SCREEN 2: CONFIGURE OFFLINE</strong><span className="block text-xs text-gray-400 mt-1">732:1058</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-screen-3-preview-offline"><strong>Section - SCREEN 3: PREVIEW OFFLINE</strong><span className="block text-xs text-gray-400 mt-1">732:1339</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-screen-4-save-offline"><strong>Section - SCREEN 4: SAVE OFFLINE</strong><span className="block text-xs text-gray-400 mt-1">732:1556</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-offline-about"><strong>Section - OFFLINE ABOUT</strong><span className="block text-xs text-gray-400 mt-1">696:1390</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-offline-devices"><strong>Section - OFFLINE DEVICES</strong><span className="block text-xs text-gray-400 mt-1">696:1171</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-offline-search"><strong>Section - OFFLINE SEARCH</strong><span className="block text-xs text-gray-400 mt-1">696:1067</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-offline-documents"><strong>Section - OFFLINE DOCUMENTS</strong><span className="block text-xs text-gray-400 mt-1">696:963</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-offline-dashboard"><strong>Section - OFFLINE DASHBOARD</strong><span className="block text-xs text-gray-400 mt-1">696:859</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-offline-settings"><strong>Section - OFFLINE SETTINGS</strong><span className="block text-xs text-gray-400 mt-1">696:1275</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/9-document-preview-overlay"><strong>9. DOCUMENT PREVIEW OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:843</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/7-move-to-folder-overlay"><strong>7. MOVE TO FOLDER OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:736</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/6-rename-file-overlay"><strong>6. RENAME FILE OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:705</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/5-sort-options-overlay"><strong>5. SORT OPTIONS OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:671</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/4-file-type-filter-overlay"><strong>4. FILE TYPE FILTER OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:638</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/3-department-filter-overlay"><strong>3. DEPARTMENT FILTER OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:605</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/2-export-options-overlay"><strong>2. EXPORT OPTIONS OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:567</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/8-print-settings-overlay"><strong>8. PRINT SETTINGS OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:788</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/1-new-folder-overlay"><strong>1. NEW FOLDER OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">619:533</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/2-paper-routing-folder-route-with-subfolders-overlay"><strong>2. PAPER ROUTING / FOLDER ROUTE WITH SUBFOLDERS OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">606:1048</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/5-resolution-overlay"><strong>5. RESOLUTION OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">606:932</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/6-color-mode-overlay"><strong>6. COLOR MODE OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">606:963</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/3-browse-folder-overlay"><strong>3. BROWSE FOLDER OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">606:998</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/4-bond-paper-size-overlay"><strong>4. BOND PAPER SIZE OVERLAY</strong><span className="block text-xs text-gray-400 mt-1">606:901</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/overlay-select-department"><strong>OVERLAY SELECT DEPARTMENT</strong><span className="block text-xs text-gray-400 mt-1">606:831</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-03-configure"><strong>Section 03 - Configure</strong><span className="block text-xs text-gray-400 mt-1">601:526</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/documents-save"><strong>DOCUMENTS SAVE</strong><span className="block text-xs text-gray-400 mt-1">425:1253</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-03-preview"><strong>Section - 03 Preview</strong><span className="block text-xs text-gray-400 mt-1">398:956</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-03-save"><strong>Section - 03 Save</strong><span className="block text-xs text-gray-400 mt-1">398:1102</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/changes-saved"><strong>CHANGES SAVED</strong><span className="block text-xs text-gray-400 mt-1">370:586</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/saved"><strong>SAVED</strong><span className="block text-xs text-gray-400 mt-1">370:573</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-send-feedback"><strong>Section - Send Feedback</strong><span className="block text-xs text-gray-400 mt-1">366:426</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-available-devices"><strong>Section - Available Devices</strong><span className="block text-xs text-gray-400 mt-1">271:668</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-10-save-preferences"><strong>Section - 10 Save Preferences</strong><span className="block text-xs text-gray-400 mt-1">38:1713</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-09-help-assistant"><strong>Section - 09 Help Assistant</strong><span className="block text-xs text-gray-400 mt-1">38:1565</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-report-an-issue"><strong>Section - Report an Issue</strong><span className="block text-xs text-gray-400 mt-1">366:487</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-08-about"><strong>Section - 08 About</strong><span className="block text-xs text-gray-400 mt-1">38:1430</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-07-settings"><strong>Section - 07 Settings</strong><span className="block text-xs text-gray-400 mt-1">38:1255</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-06-devices"><strong>Section - 06 Devices</strong><span className="block text-xs text-gray-400 mt-1">38:1081</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-05-search"><strong>Section - 05 Search</strong><span className="block text-xs text-gray-400 mt-1">38:928</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-04-documents"><strong>Section - 04 Documents</strong><span className="block text-xs text-gray-400 mt-1">38:667</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-03-scan"><strong>Section - 03 Scan</strong><span className="block text-xs text-gray-400 mt-1">38:404</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-02-dashboard"><strong>Section - 02 Dashboard</strong><span className="block text-xs text-gray-400 mt-1">38:168</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-account-menu"><strong>Section  - Account Menu</strong><span className="block text-xs text-gray-400 mt-1">212:367</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/002-splash-screen"><strong>002- Splash Screen</strong><span className="block text-xs text-gray-400 mt-1">38:4</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/forgot-password"><strong>FORGOT PASSWORD</strong><span className="block text-xs text-gray-400 mt-1">1192:826</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-1-2-activate-account"><strong>Section - 1.2 Activate Account</strong><span className="block text-xs text-gray-400 mt-1">1192:850</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/section-1-1-returning-user-login"><strong>Section - 1.1 Returning User Login</strong><span className="block text-xs text-gray-400 mt-1">1189:1295</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/no-internet-connection"><strong>NO INTERNET CONNECTION</strong><span className="block text-xs text-gray-400 mt-1">1193:1062</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/checking-credentials"><strong>CHECKING CREDENTIALS</strong><span className="block text-xs text-gray-400 mt-1">1194:1078</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/validating-serial-key"><strong>VALIDATING SERIAL KEY</strong><span className="block text-xs text-gray-400 mt-1">1194:1090</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/account-activated"><strong>ACCOUNT ACTIVATED</strong><span className="block text-xs text-gray-400 mt-1">1194:1106</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/checking-connection"><strong>CHECKING CONNECTION</strong><span className="block text-xs text-gray-400 mt-1">1194:1123</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/request-sent-successfully"><strong>REQUEST SENT SUCCESSFULLY</strong><span className="block text-xs text-gray-400 mt-1">1230:860</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/request-through-sms"><strong>REQUEST THROUGH SMS</strong><span className="block text-xs text-gray-400 mt-1">1230:872</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/request-through-email"><strong>REQUEST THROUGH EMAIL</strong><span className="block text-xs text-gray-400 mt-1">1230:887</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/need-account-access"><strong>NEED ACCOUNT ACCESS?</strong><span className="block text-xs text-gray-400 mt-1">1230:902</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/print-saved-document"><strong>PRINT SAVED DOCUMENT</strong><span className="block text-xs text-gray-400 mt-1">1316:842</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/confirm-print-job"><strong>Confirm Print Job</strong><span className="block text-xs text-gray-400 mt-1">1316:885</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/print-completed"><strong>Print Completed</strong><span className="block text-xs text-gray-400 mt-1">1316:971</span></a>
        <a className="card-surface p-4 hover:border-brand-emerald transition block" href="/figma/request-sent-for-forgot-password-successfully"><strong>REQUEST SENT FOR FORGOT PASSWORD SUCCESSFULLY</strong><span className="block text-xs text-gray-400 mt-1">1817:1195</span></a>
      </div>
    </main>
  );
}

export default function FigmaApp() {
  return (
    <Routes>
      <Route path="/figma/gallery" element={<AllScreensIndex />} />
      <Route path="/figma" element={<Navigate to={`/figma/${flow.entry}`} replace />} />
      <Route path="/figma/feedback-submitted" element={<FeedbackSubmittedScreen />} />
      <Route path="/figma/report-successfully" element={<ReportSuccessfullyScreen />} />
      <Route path="/figma/export-successfully" element={<ExportSuccessfullyScreen />} />
      <Route path="/figma/log-out-for-offline-user-account" element={<LogOutForOfflineUserAccountScreen />} />
      <Route path="/figma/offline-local-save-folder" element={<OfflineLocalSaveFolderScreen />} />
      <Route path="/figma/section-screen-1-select-scanner-offline" element={<SectionScreen1SelectScannerOfflineScreen />} />
      <Route path="/figma/section-screen-2-configure-offline" element={<SectionScreen2ConfigureOfflineScreen />} />
      <Route path="/figma/section-screen-3-preview-offline" element={<SectionScreen3PreviewOfflineScreen />} />
      <Route path="/figma/section-screen-4-save-offline" element={<SectionScreen4SaveOfflineScreen />} />
      <Route path="/figma/section-offline-about" element={<SectionOfflineAboutScreen />} />
      <Route path="/figma/section-offline-devices" element={<SectionOfflineDevicesScreen />} />
      <Route path="/figma/section-offline-search" element={<SectionOfflineSearchScreen />} />
      <Route path="/figma/section-offline-documents" element={<SectionOfflineDocumentsScreen />} />
      <Route path="/figma/section-offline-dashboard" element={<SectionOfflineDashboardScreen />} />
      <Route path="/figma/section-offline-settings" element={<SectionOfflineSettingsScreen />} />
      <Route path="/figma/9-document-preview-overlay" element={<S9DocumentPreviewOverlayScreen />} />
      <Route path="/figma/7-move-to-folder-overlay" element={<S7MoveToFolderOverlayScreen />} />
      <Route path="/figma/6-rename-file-overlay" element={<S6RenameFileOverlayScreen />} />
      <Route path="/figma/5-sort-options-overlay" element={<S5SortOptionsOverlayScreen />} />
      <Route path="/figma/4-file-type-filter-overlay" element={<S4FileTypeFilterOverlayScreen />} />
      <Route path="/figma/3-department-filter-overlay" element={<S3DepartmentFilterOverlayScreen />} />
      <Route path="/figma/2-export-options-overlay" element={<S2ExportOptionsOverlayScreen />} />
      <Route path="/figma/8-print-settings-overlay" element={<S8PrintSettingsOverlayScreen />} />
      <Route path="/figma/1-new-folder-overlay" element={<S1NewFolderOverlayScreen />} />
      <Route path="/figma/2-paper-routing-folder-route-with-subfolders-overlay" element={<S2PaperRoutingFolderRouteWithSubfoldersOverlayScreen />} />
      <Route path="/figma/5-resolution-overlay" element={<S5ResolutionOverlayScreen />} />
      <Route path="/figma/6-color-mode-overlay" element={<S6ColorModeOverlayScreen />} />
      <Route path="/figma/3-browse-folder-overlay" element={<S3BrowseFolderOverlayScreen />} />
      <Route path="/figma/4-bond-paper-size-overlay" element={<S4BondPaperSizeOverlayScreen />} />
      <Route path="/figma/overlay-select-department" element={<OverlaySelectDepartmentScreen />} />
      <Route path="/figma/section-03-configure" element={<Section03ConfigureScreen />} />
      <Route path="/figma/documents-save" element={<DocumentsSaveScreen />} />
      <Route path="/figma/section-03-preview" element={<Section03PreviewScreen />} />
      <Route path="/figma/section-03-save" element={<Section03SaveScreen />} />
      <Route path="/figma/changes-saved" element={<ChangesSavedScreen />} />
      <Route path="/figma/saved" element={<SavedScreen />} />
      <Route path="/figma/section-send-feedback" element={<SectionSendFeedbackScreen />} />
      <Route path="/figma/section-available-devices" element={<SectionAvailableDevicesScreen />} />
      <Route path="/figma/section-10-save-preferences" element={<Section10SavePreferencesScreen />} />
      <Route path="/figma/section-09-help-assistant" element={<Section09HelpAssistantScreen />} />
      <Route path="/figma/section-report-an-issue" element={<SectionReportAnIssueScreen />} />
      <Route path="/figma/section-08-about" element={<Section08AboutScreen />} />
      <Route path="/figma/section-07-settings" element={<Section07SettingsScreen />} />
      <Route path="/figma/section-06-devices" element={<Section06DevicesScreen />} />
      <Route path="/figma/section-05-search" element={<Section05SearchScreen />} />
      <Route path="/figma/section-04-documents" element={<Section04DocumentsScreen />} />
      <Route path="/figma/section-03-scan" element={<Section03ScanScreen />} />
      <Route path="/figma/section-02-dashboard" element={<Section02DashboardScreen />} />
      <Route path="/figma/section-account-menu" element={<SectionAccountMenuScreen />} />
      <Route path="/figma/002-splash-screen" element={<S002SplashScreenScreen />} />
      <Route path="/figma/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/figma/section-1-2-activate-account" element={<Section12ActivateAccountScreen />} />
      <Route path="/figma/section-1-1-returning-user-login" element={<Section11ReturningUserLoginScreen />} />
      <Route path="/figma/no-internet-connection" element={<NoInternetConnectionScreen />} />
      <Route path="/figma/checking-credentials" element={<CheckingCredentialsScreen />} />
      <Route path="/figma/validating-serial-key" element={<ValidatingSerialKeyScreen />} />
      <Route path="/figma/account-activated" element={<AccountActivatedScreen />} />
      <Route path="/figma/checking-connection" element={<CheckingConnectionScreen />} />
      <Route path="/figma/request-sent-successfully" element={<RequestSentSuccessfullyScreen />} />
      <Route path="/figma/request-through-sms" element={<RequestThroughSmsScreen />} />
      <Route path="/figma/request-through-email" element={<RequestThroughEmailScreen />} />
      <Route path="/figma/need-account-access" element={<NeedAccountAccessScreen />} />
      <Route path="/figma/print-saved-document" element={<PrintSavedDocumentScreen />} />
      <Route path="/figma/confirm-print-job" element={<ConfirmPrintJobScreen />} />
      <Route path="/figma/print-completed" element={<PrintCompletedScreen />} />
      <Route path="/figma/request-sent-for-forgot-password-successfully" element={<RequestSentForForgotPasswordSuccessfullyScreen />} />
      <Route path="*" element={<Navigate to="/figma/gallery" replace />} />
    </Routes>
  );
}
