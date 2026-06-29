import AdminDashboardFigmaShell from "../components/portal/AdminDashboardFigmaShell";

const FIGMA_ID = "2226:1193";

export function AdminDashboard22261193Screen() {
  return (
    <AdminDashboardFigmaShell
      figmaId={FIGMA_ID}
      screen="admin-dashboard-2226-1193"
      breadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
    />
  );
}

export default AdminDashboard22261193Screen;
