import AdminPortalPage from "../components/portal/AdminPortalPage";
import NotificationsCenterBody from "../components/portal/NotificationsCenterBody";

const FIGMA_ID = "2226:1193";
const DASHBOARD_HREF = "/admin-dashboard-2226-1193";

export function AdminDashboardNotificationsCenterScreen() {
  return (
    <AdminPortalPage
      figmaId={FIGMA_ID}
      screen="admin-dashboard-notifications-center"
      breadcrumb={[
        { label: "Dashboard", to: DASHBOARD_HREF },
        { label: "Notifications Center" },
      ]}
      showTopBar={false}
    >
      {({ refreshToken }) => (
        <NotificationsCenterBody closeHref={DASHBOARD_HREF} refreshToken={refreshToken} />
      )}
    </AdminPortalPage>
  );
}

export default AdminDashboardNotificationsCenterScreen;
