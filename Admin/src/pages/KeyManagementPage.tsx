import { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import LicenseKeyManagementScreenBody from "../components/portal/LicenseKeyManagementScreenBody";
import AdminKeyExtensionRequestsPanel from "../components/portal/AdminKeyExtensionRequestsPanel";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { useNotificationStore } from "../store/notificationStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { useAdminScope } from "../hooks/useAdminScope";
import {
  buildKeyCatalogStats,
  buildKeyDepartmentOptions,
  mapKeysToCatalogRows,
} from "../lib/adminPortalMappers";
import { PORTAL } from "../routes/portalPaths";
import type { AdminUser, SerialKey } from "../types";
import type { LicenseKeyCatalogRow } from "../data/demoLicenseKeyCatalog";
import type { LicenseKeyRevokeRequestPayload } from "../components/portal/LicenseKeyRevokeRequestModal";
import "../styles/license-key-catalog-screen.css";
import "../styles/filter-picker-modal.css";
import "../styles/license-key-revoke-request-modal.css";
import "../styles/license-key-revoke-request-submitted-modal.css";
import "../styles/export-successful-modal.css";
import "../styles/page-transition.css";

export default function KeyManagementPage() {
  const { scope } = useAdminScope();
  const [keys, setKeys] = useState<SerialKey[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(() => {
    Promise.all([keysApi.list(), usersApi.list()])
      .then(([nextKeys, nextUsers]) => {
        setKeys(nextKeys);
        setUsers(nextUsers);
      })
      .catch(() => push("Failed to load keys", "error"));
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(load, "Serial keys refreshed");

  const catalogRows = useMemo(
    () => mapKeysToCatalogRows(keys, users, scope.company),
    [keys, users, scope.company],
  );

  const summaryStats = useMemo(() => {
    const stats = buildKeyCatalogStats(catalogRows);
    return { used: stats.used, unused: stats.unused };
  }, [catalogRows]);

  const departmentOptions = useMemo(
    () => buildKeyDepartmentOptions(catalogRows),
    [catalogRows],
  );

  const handleRevokeSubmit = async (
    row: LicenseKeyCatalogRow,
    payload: LicenseKeyRevokeRequestPayload,
  ) => {
    await keysApi.createRevocationRequest({
      requestType: "key",
      targetId: row.id,
      reason:
        payload.reasonId === "other"
          ? payload.otherReason
          : payload.reasonId,
    });
    push("Revoke request submitted", "success");
    load();
  };

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "User Registration", to: PORTAL.users }, { label: "Keys" }]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showUtilities={false}
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <AdminKeyExtensionRequestsPanel />
        <LicenseKeyManagementScreenBody
          rows={catalogRows}
          assignedOrganization={scope.company}
          assignedSerialKeys={catalogRows.length}
          summaryStats={summaryStats}
          departmentOptions={departmentOptions}
          onRevokeSubmit={handleRevokeSubmit}
        />
      </ScreenRefreshFrame>
    </>
  );
}
