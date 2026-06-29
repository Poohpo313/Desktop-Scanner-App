import { Link, Navigate, Route, Routes } from "react-router-dom";
import SuperAdminDeviceManagementScreen from "./screens/super-admin-device-management";
import SuperAdminKeyScreen from "./screens/super-admin-key";
import SuperAdminLogsScreen from "./screens/super-admin-logs";
import SuperAdminCloudScreen from "./screens/super-admin-cloud";
import UserVerificationScreen from "./screens/user-verification";
import SuperAdminHelpScreen from "./screens/super-admin-help";
import SuperAdminSettingsScreen from "./screens/super-admin-settings";
import SuperAdminSettings13642741Screen from "./screens/super-admin-settings-1364-2741";
import SuperAdminSettings14383780Screen from "./screens/super-admin-settings-1438-3780";
import RegisteredSuccessfullyScreen from "./screens/registered-successfully";
import DeleteDeviceScreen from "./screens/delete-device";
import SucessfullyDeletedScreen from "./screens/sucessfully-deleted";
import SucessfullyDeleted1709945Screen from "./screens/sucessfully-deleted-1709-945";
import ChangesSavedSuccessfullyScreen from "./screens/changes-saved-successfully";
import EmailRecoveryConfirmationScreen from "./screens/email-recovery-confirmation";
import RecoverAdministratorPinScreen from "./screens/recover-administrator-pin";
import AdministratorPinScreen from "./screens/administrator-pin";
import SplashScreenScreen from "./screens/splash-screen";
import SuperAdminAccountSettingScreen from "./screens/super-admin-account-setting";
import SuperAdminDashboadrSectionScreen from "./screens/super-admin-dashboadr-section";
import UserProfileDeleteScreen from "./screens/user-profile-delete";
import AdminProfileDeleteScreen from "./screens/admin-profile-delete";
import SucessfullyDeleted1426904Screen from "./screens/sucessfully-deleted-1426-904";
import SucessfullyDeleted1752985Screen from "./screens/sucessfully-deleted-1752-985";
import SuperAdminRegistration1Screen from "./screens/super-admin-registration-1";
import AdministratorsRegistration2Screen from "./screens/administrators-registration-2";
import DeleteDevice1490866Screen from "./screens/delete-device-1490-866";
import DeleteDevice1752889Screen from "./screens/delete-device-1752-889";
import SucessfullyDeleted1490882Screen from "./screens/sucessfully-deleted-1490-882";
import SucessfullyDeleted1752905Screen from "./screens/sucessfully-deleted-1752-905";
import RestoreAdminScreen from "./screens/restore-admin";
import SuccessfullySavedScreen from "./screens/successfully-saved";
import RestoreUserScreen from "./screens/restore-user";
import RevokeKeyScreen from "./screens/revoke-key";
import RevokedSuccessfullyScreen from "./screens/revoked-successfully";
import CloudUpdateScreen from "./screens/cloud-update";
import ReportsFilterScreen from "./screens/reports-filter";
import TroubleshootingFilterScreen from "./screens/troubleshooting-filter";
import ExportSuccessfullyScreen from "./screens/export-successfully";
import RejectCloudScreen from "./screens/reject-cloud";
import RejectCloud1709961Screen from "./screens/reject-cloud-1709-961";
import RejectCloud17091009Screen from "./screens/reject-cloud-1709-1009";
import RejectCloud1709993Screen from "./screens/reject-cloud-1709-993";
import RejectCloud1709977Screen from "./screens/reject-cloud-1709-977";
import RejectCloud16982119Screen from "./screens/reject-cloud-1698-2119";
import RejectCloud17091036Screen from "./screens/reject-cloud-1709-1036";
import RejectCloud17091069Screen from "./screens/reject-cloud-1709-1069";
import RejectCloud17091058Screen from "./screens/reject-cloud-1709-1058";
import RejectCloud17091047Screen from "./screens/reject-cloud-1709-1047";
import SelectAnOptionScreen from "./screens/select-an-option";
import SortScreen from "./screens/sort";
import SelectDepartmentScreen from "./screens/select-department";
import NotifyUserScreen from "./screens/notify-user";
import NotifyUser18031540Screen from "./screens/notify-user-1803-1540";
import PasswordVerificationScreen from "./screens/password-verification";
import SelectSortScreen from "./screens/select-sort";
import SelectLanguageScreen from "./screens/select-language";
import SuperAdminAccountSetting18601221Screen from "./screens/super-admin-account-setting-1860-1221";
import SuperAdminSettings18601668Screen from "./screens/super-admin-settings-1860-1668";
import EditUserScreen from "./screens/edit-user";
import RegisterUserScreen from "./screens/register-user";
import UpdateScreen from "./screens/update";
import RegisterAdminScreen from "./screens/register-admin";
import EditAdminScreen from "./screens/edit-admin";
import ExportSuccessfully21671192Screen from "./screens/export-successfully-2167-1192";
import FilterScreen from "./screens/filter";
import BackupManagementScreen from "./screens/backup-management";

function AllScreensIndex() {
  return (
    <main className="screen-index">
      <h1>Super Admin Interface</h1>
      <p>67 React screens from Figma (flowchart excluded).</p>
      <div className="screen-index__grid">
          <Link className="screen-index__card" to="/super-admin-device-management"><strong>{"SUPER ADMIN DEVICE MANAGEMENT"}</strong><span>822:2767</span></Link>
          <Link className="screen-index__card" to="/super-admin-key"><strong>{"SUPER ADMIN KEY"}</strong><span>822:2818</span></Link>
          <Link className="screen-index__card" to="/super-admin-logs"><strong>{"SUPER ADMIN LOGS"}</strong><span>859:991</span></Link>
          <Link className="screen-index__card" to="/super-admin-cloud"><strong>{"SUPER ADMIN CLOUD"}</strong><span>859:1039</span></Link>
          <Link className="screen-index__card" to="/user-verification"><strong>{"USER VERIFICATION"}</strong><span>1622:1568</span></Link>
          <Link className="screen-index__card" to="/super-admin-help"><strong>{"SUPER ADMIN HELP"}</strong><span>896:942</span></Link>
          <Link className="screen-index__card" to="/super-admin-settings"><strong>{"SUPER ADMIN SETTINGS"}</strong><span>896:991</span></Link>
          <Link className="screen-index__card" to="/super-admin-settings-1364-2741"><strong>{"SUPER ADMIN SETTINGS"}</strong><span>1364:2741</span></Link>
          <Link className="screen-index__card" to="/super-admin-settings-1438-3780"><strong>{"SUPER ADMIN SETTINGS"}</strong><span>1438:3780</span></Link>
          <Link className="screen-index__card" to="/registered-successfully"><strong>{"REGISTERED SUCCESSFULLY"}</strong><span>894:1780</span></Link>
          <Link className="screen-index__card" to="/delete-device"><strong>{"DELETE DEVICE"}</strong><span>1307:1781</span></Link>
          <Link className="screen-index__card" to="/sucessfully-deleted"><strong>{"SUCESSFULLY DELETED"}</strong><span>1307:1805</span></Link>
          <Link className="screen-index__card" to="/sucessfully-deleted-1709-945"><strong>{"SUCESSFULLY DELETED"}</strong><span>1709:945</span></Link>
          <Link className="screen-index__card" to="/changes-saved-successfully"><strong>{"CHANGES SAVED SUCCESSFULLY"}</strong><span>1335:973</span></Link>
          <Link className="screen-index__card" to="/email-recovery-confirmation"><strong>{"EMAIL RECOVERY CONFIRMATION"}</strong><span>1341:1224</span></Link>
          <Link className="screen-index__card" to="/recover-administrator-pin"><strong>{"RECOVER ADMINISTRATOR PIN"}</strong><span>1341:1136</span></Link>
          <Link className="screen-index__card" to="/administrator-pin"><strong>{"ADMINISTRATOR PIN"}</strong><span>1341:1083</span></Link>
          <Link className="screen-index__card" to="/splash-screen"><strong>{"SPLASH SCREEN"}</strong><span>1341:1051</span></Link>
          <Link className="screen-index__card" to="/super-admin-account-setting"><strong>{"Super Admin Account Setting"}</strong><span>1364:2522</span></Link>
          <Link className="screen-index__card" to="/super-admin-dashboadr-section"><strong>{"SUPER ADMIN DASHBOADR SECTION"}</strong><span>1397:835</span></Link>
          <Link className="screen-index__card" to="/user-profile-delete"><strong>{"User profile delete"}</strong><span>1426:888</span></Link>
          <Link className="screen-index__card" to="/admin-profile-delete"><strong>{"Admin profile delete"}</strong><span>1752:969</span></Link>
          <Link className="screen-index__card" to="/sucessfully-deleted-1426-904"><strong>{"SUCESSFULLY DELETED"}</strong><span>1426:904</span></Link>
          <Link className="screen-index__card" to="/sucessfully-deleted-1752-985"><strong>{"SUCESSFULLY DELETED"}</strong><span>1752:985</span></Link>
          <Link className="screen-index__card" to="/super-admin-registration-1"><strong>{"SUPER ADMIN REGISTRATION 1"}</strong><span>822:2817</span></Link>
          <Link className="screen-index__card" to="/administrators-registration-2"><strong>{"ADMINISTRATORS REGISTRATION 2"}</strong><span>1468:1156</span></Link>
          <Link className="screen-index__card" to="/delete-device-1490-866"><strong>{"DELETE DEVICE"}</strong><span>1490:866</span></Link>
          <Link className="screen-index__card" to="/delete-device-1752-889"><strong>{"DELETE DEVICE"}</strong><span>1752:889</span></Link>
          <Link className="screen-index__card" to="/sucessfully-deleted-1490-882"><strong>{"SUCESSFULLY DELETED"}</strong><span>1490:882</span></Link>
          <Link className="screen-index__card" to="/sucessfully-deleted-1752-905"><strong>{"SUCESSFULLY DELETED"}</strong><span>1752:905</span></Link>
          <Link className="screen-index__card" to="/restore-admin"><strong>{"Restore Admin"}</strong><span>1539:884</span></Link>
          <Link className="screen-index__card" to="/successfully-saved"><strong>{"Successfully Saved"}</strong><span>1752:1013</span></Link>
          <Link className="screen-index__card" to="/restore-user"><strong>{"RESTORE User"}</strong><span>1539:871</span></Link>
          <Link className="screen-index__card" to="/revoke-key"><strong>{"REVOKE KEY?"}</strong><span>1578:864</span></Link>
          <Link className="screen-index__card" to="/revoked-successfully"><strong>{"REVOKED SUCCESSFULLY"}</strong><span>1578:887</span></Link>
          <Link className="screen-index__card" to="/cloud-update"><strong>{"Cloud Update"}</strong><span>1622:1099</span></Link>
          <Link className="screen-index__card" to="/reports-filter"><strong>{"REPORTS FILTER"}</strong><span>1654:1294</span></Link>
          <Link className="screen-index__card" to="/troubleshooting-filter"><strong>{"TROUBLESHOOTING FILTER"}</strong><span>1654:1318</span></Link>
          <Link className="screen-index__card" to="/export-successfully"><strong>{"EXPORT SUCCESSFULLY"}</strong><span>1654:1365</span></Link>
          <Link className="screen-index__card" to="/reject-cloud"><strong>{"Reject Cloud"}</strong><span>1698:2043</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-961"><strong>{"Reject Cloud"}</strong><span>1709:961</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-1009"><strong>{"Reject Cloud"}</strong><span>1709:1009</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-993"><strong>{"Reject Cloud"}</strong><span>1709:993</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-977"><strong>{"Reject Cloud"}</strong><span>1709:977</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1698-2119"><strong>{"Reject Cloud"}</strong><span>1698:2119</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-1036"><strong>{"Reject Cloud"}</strong><span>1709:1036</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-1069"><strong>{"Reject Cloud"}</strong><span>1709:1069</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-1058"><strong>{"Reject Cloud"}</strong><span>1709:1058</span></Link>
          <Link className="screen-index__card" to="/reject-cloud-1709-1047"><strong>{"Reject Cloud"}</strong><span>1709:1047</span></Link>
          <Link className="screen-index__card" to="/select-an-option"><strong>{"Select an Option"}</strong><span>1752:4341</span></Link>
          <Link className="screen-index__card" to="/sort"><strong>{"Sort"}</strong><span>1752:4500</span></Link>
          <Link className="screen-index__card" to="/select-department"><strong>{"SELECT DEPARTMENT"}</strong><span>1803:1302</span></Link>
          <Link className="screen-index__card" to="/notify-user"><strong>{"NOTIFY USER"}</strong><span>1803:1357</span></Link>
          <Link className="screen-index__card" to="/notify-user-1803-1540"><strong>{"NOTIFY USER"}</strong><span>1803:1540</span></Link>
          <Link className="screen-index__card" to="/password-verification"><strong>{"PASSWORD VERIFICATION"}</strong><span>1822:1189</span></Link>
          <Link className="screen-index__card" to="/select-sort"><strong>{"SELECT SORT"}</strong><span>1833:1192</span></Link>
          <Link className="screen-index__card" to="/select-language"><strong>{"SELECT LANGUAGE"}</strong><span>1841:1637</span></Link>
          <Link className="screen-index__card" to="/super-admin-account-setting-1860-1221"><strong>{"Super Admin Account Setting"}</strong><span>1860:1221</span></Link>
          <Link className="screen-index__card" to="/super-admin-settings-1860-1668"><strong>{"SUPER ADMIN SETTINGS"}</strong><span>1860:1668</span></Link>
          <Link className="screen-index__card" to="/edit-user"><strong>{"EDIT USER"}</strong><span>1972:1295</span></Link>
          <Link className="screen-index__card" to="/register-user"><strong>{"REGISTER USER"}</strong><span>1972:1411</span></Link>
          <Link className="screen-index__card" to="/update"><strong>{"Update"}</strong><span>2041:1192</span></Link>
          <Link className="screen-index__card" to="/register-admin"><strong>{"REGISTER ADMIN"}</strong><span>2076:1193</span></Link>
          <Link className="screen-index__card" to="/edit-admin"><strong>{"EDIT ADMIN"}</strong><span>2081:1477</span></Link>
          <Link className="screen-index__card" to="/export-successfully-2167-1192"><strong>{"EXPORT SUCCESSFULLY"}</strong><span>2167:1192</span></Link>
          <Link className="screen-index__card" to="/filter"><strong>{"FILTER"}</strong><span>2168:1225</span></Link>
          <Link className="screen-index__card" to="/backup-management"><strong>{"BACKUP MANAGEMENT"}</strong><span>2189:1660</span></Link>
      </div>
    </main>
  );
}

export default function FigmaApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash-screen" replace />} />
      <Route path="/all-screens" element={<AllScreensIndex />} />
      <Route path="/super-admin-device-management" element={<SuperAdminDeviceManagementScreen />} />
      <Route path="/super-admin-key" element={<SuperAdminKeyScreen />} />
      <Route path="/super-admin-logs" element={<SuperAdminLogsScreen />} />
      <Route path="/super-admin-cloud" element={<SuperAdminCloudScreen />} />
      <Route path="/user-verification" element={<UserVerificationScreen />} />
      <Route path="/super-admin-help" element={<SuperAdminHelpScreen />} />
      <Route path="/super-admin-settings" element={<SuperAdminSettingsScreen />} />
      <Route path="/super-admin-settings-1364-2741" element={<SuperAdminSettings13642741Screen />} />
      <Route path="/super-admin-settings-1438-3780" element={<SuperAdminSettings14383780Screen />} />
      <Route path="/registered-successfully" element={<RegisteredSuccessfullyScreen />} />
      <Route path="/delete-device" element={<DeleteDeviceScreen />} />
      <Route path="/sucessfully-deleted" element={<SucessfullyDeletedScreen />} />
      <Route path="/sucessfully-deleted-1709-945" element={<SucessfullyDeleted1709945Screen />} />
      <Route path="/changes-saved-successfully" element={<ChangesSavedSuccessfullyScreen />} />
      <Route path="/email-recovery-confirmation" element={<EmailRecoveryConfirmationScreen />} />
      <Route path="/recover-administrator-pin" element={<RecoverAdministratorPinScreen />} />
      <Route path="/administrator-pin" element={<AdministratorPinScreen />} />
      <Route path="/splash-screen" element={<SplashScreenScreen />} />
      <Route path="/super-admin-account-setting" element={<SuperAdminAccountSettingScreen />} />
      <Route path="/super-admin-dashboadr-section" element={<SuperAdminDashboadrSectionScreen />} />
      <Route path="/user-profile-delete" element={<UserProfileDeleteScreen />} />
      <Route path="/admin-profile-delete" element={<AdminProfileDeleteScreen />} />
      <Route path="/sucessfully-deleted-1426-904" element={<SucessfullyDeleted1426904Screen />} />
      <Route path="/sucessfully-deleted-1752-985" element={<SucessfullyDeleted1752985Screen />} />
      <Route path="/super-admin-registration-1" element={<SuperAdminRegistration1Screen />} />
      <Route path="/administrators-registration-2" element={<AdministratorsRegistration2Screen />} />
      <Route path="/delete-device-1490-866" element={<DeleteDevice1490866Screen />} />
      <Route path="/delete-device-1752-889" element={<DeleteDevice1752889Screen />} />
      <Route path="/sucessfully-deleted-1490-882" element={<SucessfullyDeleted1490882Screen />} />
      <Route path="/sucessfully-deleted-1752-905" element={<SucessfullyDeleted1752905Screen />} />
      <Route path="/restore-admin" element={<RestoreAdminScreen />} />
      <Route path="/successfully-saved" element={<SuccessfullySavedScreen />} />
      <Route path="/restore-user" element={<RestoreUserScreen />} />
      <Route path="/revoke-key" element={<RevokeKeyScreen />} />
      <Route path="/revoked-successfully" element={<RevokedSuccessfullyScreen />} />
      <Route path="/cloud-update" element={<CloudUpdateScreen />} />
      <Route path="/reports-filter" element={<ReportsFilterScreen />} />
      <Route path="/troubleshooting-filter" element={<TroubleshootingFilterScreen />} />
      <Route path="/export-successfully" element={<ExportSuccessfullyScreen />} />
      <Route path="/reject-cloud" element={<RejectCloudScreen />} />
      <Route path="/reject-cloud-1709-961" element={<RejectCloud1709961Screen />} />
      <Route path="/reject-cloud-1709-1009" element={<RejectCloud17091009Screen />} />
      <Route path="/reject-cloud-1709-993" element={<RejectCloud1709993Screen />} />
      <Route path="/reject-cloud-1709-977" element={<RejectCloud1709977Screen />} />
      <Route path="/reject-cloud-1698-2119" element={<RejectCloud16982119Screen />} />
      <Route path="/reject-cloud-1709-1036" element={<RejectCloud17091036Screen />} />
      <Route path="/reject-cloud-1709-1069" element={<RejectCloud17091069Screen />} />
      <Route path="/reject-cloud-1709-1058" element={<RejectCloud17091058Screen />} />
      <Route path="/reject-cloud-1709-1047" element={<RejectCloud17091047Screen />} />
      <Route path="/select-an-option" element={<SelectAnOptionScreen />} />
      <Route path="/sort" element={<SortScreen />} />
      <Route path="/select-department" element={<SelectDepartmentScreen />} />
      <Route path="/notify-user" element={<NotifyUserScreen />} />
      <Route path="/notify-user-1803-1540" element={<NotifyUser18031540Screen />} />
      <Route path="/password-verification" element={<PasswordVerificationScreen />} />
      <Route path="/select-sort" element={<SelectSortScreen />} />
      <Route path="/select-language" element={<SelectLanguageScreen />} />
      <Route path="/super-admin-account-setting-1860-1221" element={<SuperAdminAccountSetting18601221Screen />} />
      <Route path="/super-admin-settings-1860-1668" element={<SuperAdminSettings18601668Screen />} />
      <Route path="/edit-user" element={<EditUserScreen />} />
      <Route path="/register-user" element={<RegisterUserScreen />} />
      <Route path="/update" element={<UpdateScreen />} />
      <Route path="/register-admin" element={<RegisterAdminScreen />} />
      <Route path="/edit-admin" element={<EditAdminScreen />} />
      <Route path="/export-successfully-2167-1192" element={<ExportSuccessfully21671192Screen />} />
      <Route path="/filter" element={<FilterScreen />} />
      <Route path="/backup-management" element={<BackupManagementScreen />} />
    </Routes>
  );
}
