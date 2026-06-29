import AdminDashboardFigmaShell from "../components/portal/AdminDashboardFigmaShell";

const FIGMA_ID = "2212:2851";

export function AdminDashboardScreen() {
  return (
    <AdminDashboardFigmaShell
      figmaId={FIGMA_ID}
      screen="admin-dashboard"
      breadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
      homeHref="/admin-dashboard"
    />
  );
}

export default AdminDashboardScreen;
