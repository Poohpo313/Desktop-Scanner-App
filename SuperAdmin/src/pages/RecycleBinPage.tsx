import { useCallback, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Modal from "../components/Modal";
import { devicesApi } from "../api/devices.api";
import { adminsApi } from "../api/admins.api";
import { keysApi } from "../api/keys.api";
import { usersApi } from "../api/users.api";
import { useNotificationStore } from "../store/notificationStore";
import {
  hasRecycleBinFailures,
  recycleBinResult,
  settleRecycleBinRequest,
} from "../lib/loadRecycleBin";
import type { AdminAccount, AdminUser, Device, SerialKey } from "../types";

type RevokedKey = SerialKey & {
  revokedAt?: string;
  firstName?: string | null;
  lastName?: string | null;
};

export default function RecycleBinPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [keys, setKeys] = useState<RevokedKey[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [permanent, setPermanent] = useState<
    { type: "admin" | "user" | "device" | "key"; id: number; name: string } | null
  >(null);
  const push = useNotificationStore((s) => s.push);

  const load = useCallback(() => {
    void (async () => {
      const [adminResult, userResult, deviceResult, keyResult] = await Promise.all([
        settleRecycleBinRequest(adminsApi.recycleBin(), [] as AdminAccount[]),
        settleRecycleBinRequest(usersApi.recycleBin(), [] as AdminUser[]),
        settleRecycleBinRequest(devicesApi.recycleBin(), [] as Device[]),
        settleRecycleBinRequest(keysApi.recycleBin(), [] as SerialKey[]),
      ]);

      setAdmins(recycleBinResult(adminResult, []));
      setUsers(recycleBinResult(userResult, []));
      setDevices(recycleBinResult(deviceResult, []));
      setKeys(recycleBinResult(keyResult, []));

      if (hasRecycleBinFailures([adminResult, userResult, deviceResult, keyResult])) {
        push("Some recycle bin sections could not be loaded.", "error");
      }
    })();
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <TopBar title="Recycle Bin" />
      <main className="flex-1 space-y-6 p-6">
        <p className="text-sm text-slate-500">Items auto-empty after 30 days.</p>

        <section>
          <h2 className="font-semibold mb-3">Deleted admins</h2>
          <div className="space-y-2">
            {admins.length === 0 ? (
              <p className="text-sm text-slate-400">Empty</p>
            ) : (
              admins.map((a) => (
                <div key={a.adminId} className="flex justify-between rounded-lg border bg-white p-4 text-sm">
                  <span>{a.username}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-mid hover:underline"
                      onClick={async () => {
                        await adminsApi.restore(a.adminId);
                        push("Admin restored", "success");
                        load();
                      }}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => setPermanent({ type: "admin", id: a.adminId, name: a.username })}
                    >
                      Delete permanently
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Deleted users</h2>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-sm text-slate-400">Empty</p>
            ) : (
              users.map((u) => (
                <div key={u.userId} className="flex justify-between rounded-lg border bg-white p-4 text-sm">
                  <span>{u.username}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-mid hover:underline"
                      onClick={async () => {
                        await usersApi.restore(u.userId);
                        push("User restored", "success");
                        load();
                      }}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => setPermanent({ type: "user", id: u.userId, name: u.username })}
                    >
                      Delete permanently
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Deleted devices</h2>
          <div className="space-y-2">
            {devices.length === 0 ? (
              <p className="text-sm text-slate-400">Empty</p>
            ) : (
              devices.map((device) => (
                <div key={device.deviceId} className="flex justify-between rounded-lg border bg-white p-4 text-sm">
                  <span>{device.deviceName || device.serialNumber}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-mid hover:underline"
                      onClick={async () => {
                        try {
                          await devicesApi.restore(device.deviceId);
                          push("Device restored", "success");
                          load();
                        } catch {
                          push("Failed to restore device", "error");
                        }
                      }}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() =>
                        setPermanent({
                          type: "device",
                          id: device.deviceId,
                          name: device.deviceName || device.serialNumber,
                        })
                      }
                    >
                      Delete permanently
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Revoked serial keys (unassigned)</h2>
          <div className="space-y-2">
            {keys.length === 0 ? (
              <p className="text-sm text-slate-400">Empty</p>
            ) : (
              keys.map((key) => (
                <div key={key.serialId} className="flex justify-between rounded-lg border bg-white p-4 text-sm">
                  <span>{key.serialKey}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-mid hover:underline"
                      onClick={async () => {
                        await keysApi.restoreRevokedKey(key.serialId);
                        push("Serial key restored", "success");
                        load();
                      }}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() =>
                        setPermanent({ type: "key", id: key.serialId, name: key.serialKey })
                      }
                    >
                      Delete permanently
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Modal open={!!permanent} title="Delete permanently?" onClose={() => setPermanent(null)}>
        <p className="text-sm">
          Irreversibly delete <strong>{permanent?.name}</strong>?
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-red-600 py-2 text-white text-sm"
          onClick={async () => {
            if (!permanent) return;
            try {
              if (permanent.type === "admin") await adminsApi.permanentDelete(permanent.id);
              else if (permanent.type === "device") await devicesApi.permanentDelete(permanent.id);
              else if (permanent.type === "key") await keysApi.permanentDelete(permanent.id);
              else await usersApi.permanentDelete(permanent.id);
              push("Permanently deleted", "success");
              setPermanent(null);
              load();
            } catch {
              push("Failed to delete permanently", "error");
            }
          }}
        >
          Confirm
        </button>
      </Modal>
    </>
  );
}
