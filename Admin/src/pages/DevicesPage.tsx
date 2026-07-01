import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import ScreenRefreshFrame from "../components/ScreenRefreshFrame";
import DeviceManagementScreenBody from "../components/portal/DeviceManagementScreenBody";
import ProvisionDeviceBody from "../components/portal/ProvisionDeviceBody";
import PortalOverlay from "../components/portal/PortalOverlay";
import { devicesApi } from "../api/devices.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { useNotificationStore } from "../store/notificationStore";
import { useTopBarRefresh } from "../hooks/useTopBarRefresh";
import { useAdminScope } from "../hooks/useAdminScope";
import {
  buildDeviceDepartmentOptions,
  buildDeviceStats,
  mapDevicesToCatalogRows,
} from "../lib/adminPortalMappers";
import { useDeviceOnlineClock } from "../lib/statusDisplay";
import { extractApiError } from "../lib/extractApiError";
import { PORTAL } from "../routes/portalPaths";
import type { AdminUser, Device } from "../types";
import type { DeviceCatalogRow } from "../data/demoDeviceCatalog";
import "../styles/device-management-screen.css";
import "../styles/filter-picker-modal.css";
import "../styles/device-delete-request-modal.css";
import "../styles/device-delete-request-submitted-modal.css";
import "../styles/portal-modal.css";
import "../styles/provision-device.css";
import "../styles/page-transition.css";

export default function DevicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scope } = useAdminScope();
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [provisionOpen, setProvisionOpen] = useState(
    Boolean((location.state as { provision?: boolean } | null)?.provision),
  );
  const [loading, setLoading] = useState(true);
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    if ((location.state as { provision?: boolean } | null)?.provision) {
      setProvisionOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    const [devicesResult, usersResult] = await Promise.allSettled([
      devicesApi.list(),
      usersApi.list(),
    ]);

    if (devicesResult.status === "fulfilled") {
      setDevices(devicesResult.value);
    } else {
      push(extractApiError(devicesResult.reason, "Failed to load devices"), "error");
      setDevices([]);
    }

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value);
    } else {
      push(extractApiError(usersResult.reason, "Failed to load users"), "error");
      setUsers([]);
    }

    setLoading(false);
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load();
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const { onRefresh, refreshing, refreshToken } = useTopBarRefresh(load, "Devices refreshed");

  const presenceTick = useDeviceOnlineClock();

  const deviceRows = useMemo(
    () => mapDevicesToCatalogRows(devices, users, scope.company),
    [devices, users, scope.company, presenceTick],
  );

  const deviceStats = useMemo(() => buildDeviceStats(deviceRows), [deviceRows, presenceTick]);

  const departmentOptions = useMemo(
    () => buildDeviceDepartmentOptions(deviceRows),
    [deviceRows],
  );

  const handleDeactivateDevice = async (row: DeviceCatalogRow) => {
    try {
      await devicesApi.flagInactive(Number(row.id));
      push(
        "Device deactivated. The user can sign in on their new computer with the same account.",
        "success",
      );
      load();
    } catch {
      push("Failed to deactivate device", "error");
    }
  };

  const handleRevokeRequest = async (row: DeviceCatalogRow) => {
    try {
      await keysApi.createRevocationRequest({
        requestType: "device",
        targetId: row.id,
        reason: "Administrator device revocation request",
      });
      push("Device revoke request submitted", "success");
      load();
    } catch {
      push("Failed to submit device revoke request", "error");
      throw new Error("Device revoke request failed");
    }
  };

  const handleRegister = () => {
    setProvisionOpen(false);
    load();
  };

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "Keys", to: PORTAL.keys }, { label: "Devices" }]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showUtilities={false}
        showRefreshOnly
      />
      <ScreenRefreshFrame refreshToken={refreshToken}>
        <DeviceManagementScreenBody
          rows={deviceRows}
          stats={deviceStats}
          departmentOptions={departmentOptions}
          loading={loading}
          onRevokeRequest={handleRevokeRequest}
          onDeactivateDevice={handleDeactivateDevice}
        />
      </ScreenRefreshFrame>

      <PortalOverlay open={provisionOpen} onClose={() => setProvisionOpen(false)}>
        <ProvisionDeviceBody
          variant="portal"
          presentation="overlay"
          devicesRoute={PORTAL.devices}
          users={users}
          onCancel={() => setProvisionOpen(false)}
          onRegister={handleRegister}
          onSaveDraft={() => push("Provisioning draft saved", "success")}
        />
      </PortalOverlay>
    </>
  );
}
