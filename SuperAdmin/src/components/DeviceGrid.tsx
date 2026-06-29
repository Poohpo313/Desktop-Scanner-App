import type { AdminUser, Device } from "../types";
import { formatDeviceOnlineStatus, isDeviceOnline } from "../lib/statusDisplay";

type Props = {
  devices: Device[];
  users: AdminUser[];
  onRevoke: (device: Device) => void;
};

const getUserName = (user?: AdminUser) => {
  if (!user) return "-";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username;
};

const formatDeviceStatus = (device: Device) => formatDeviceOnlineStatus(device);

const getUserOrganization = (user?: AdminUser) =>
  user?.company ?? "-";

export default function DeviceGrid({ devices, users, onRevoke }: Props) {
  const hasDevices = devices.length > 0;

  return (
    <section className="device-management-card">
      <div className="device-management-table-wrap">
        <table className="device-management-table">
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Serial Key</th>
              <th>Registered User</th>
              <th>Organization</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => {
              const user = users.find((item) => item.userId === device.assignedUser);
              const department = user?.department ?? "-";
              const online = isDeviceOnline(device);

              return (
                <tr key={device.deviceId}>
                  <td>{device.deviceName ?? "-"}</td>
                  <td>{device.serialNumber ?? "-"}</td>
                  <td>{getUserName(user)}</td>
                  <td>{getUserOrganization(user)}</td>
                  <td>{department}</td>
                  <td>
                    <span className={`device-status device-status--${online ? "online" : "offline"}`}>
                      {formatDeviceStatus(device)}
                    </span>
                  </td>
                  <td>
                    {device.status !== "unauthorized" ? (
                      <button
                        className="device-action-button"
                        type="button"
                        onClick={() => onRevoke(device)}
                        aria-label={`Delete ${device.deviceName ?? "device"}`}
                      >
                        <span aria-hidden="true">⌫</span>
                      </button>
                    ) : (
                      <span className="device-action-placeholder">-</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {devices.length === 0 && (
              <tr>
                <td className="device-management-table__empty" colSpan={7}>
                  No devices registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="device-management-footer">
        <span>
          {hasDevices
            ? `Showing 1 to ${Math.min(devices.length, 5)} of ${devices.length} entries`
            : "Showing 0 entries"}
        </span>
        {hasDevices && (
          <div className="device-management-pagination" aria-label="Device pages">
            <button type="button">‹</button>
            <button className="device-management-pagination__active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <button type="button">5</button>
            <button type="button">›</button>
          </div>
        )}
      </div>
    </section>
  );
}
