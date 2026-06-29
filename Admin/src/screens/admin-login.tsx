import AdminLoginView from "../components/AdminLoginView";

const FIGMA_ID = "2212:2598";

export function AdminLoginScreen() {
  return (
    <div data-figma-id={FIGMA_ID} data-screen="admin-login">
      <AdminLoginView
        variant="figma"
        onSuccessNavigate="/admin-dashboard-2226-1193"
      />
    </div>
  );
}

export default AdminLoginScreen;
