import AdministratorRecoverAccessView from "../components/AdministratorRecoverAccessView";

const FIGMA_ID = "2212:1216";

export function AdminRecoverAccessScreen() {
  return (
    <div data-figma-id={FIGMA_ID} data-screen="admin-recover-access">
      <AdministratorRecoverAccessView />
    </div>
  );
}

export default AdminRecoverAccessScreen;
