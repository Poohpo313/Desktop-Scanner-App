import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { APP_STORAGE_KEYS } from "../config/appStorage";
import { type ManagedDevice } from "../components/devices/devicesData";
import {
  diagnosticsLabelForStatus,
  probeHardwareDevices,
  resolveManagedDeviceStatus,
} from "../lib/deviceHardwareSync";
import { deviceNamesMatch } from "../lib/deviceNameMatch";
import { useSession } from "./SessionContext";

type DevicesContextValue = {
  devices: ManagedDevice[];
  addDevice: (device: ManagedDevice) => void;
  addDevices: (devices: ManagedDevice[]) => void;
  updateDevice: (id: string, patch: Partial<ManagedDevice>) => void;
  getDeviceById: (id: string) => ManagedDevice | undefined;
};

const DevicesContext = createContext<DevicesContextValue | null>(null);

function dedupeManagedDevices(devices: ManagedDevice[]): ManagedDevice[] {
  const result: ManagedDevice[] = [];

  for (const device of devices) {
    const matchIndex = result.findIndex(
      (entry) => entry.id === device.id || deviceNamesMatch(entry.name, device.name),
    );
    if (matchIndex === -1) {
      result.push(device);
      continue;
    }

    const existing = result[matchIndex];
    if (device.name.toLowerCase().includes("wia") && !existing.name.toLowerCase().includes("wia")) {
      result[matchIndex] = { ...device, id: existing.id };
    }
  }

  return result;
}

function loadStoredDevices(userId: number): ManagedDevice[] {
  try {
    const raw = localStorage.getItem(`${APP_STORAGE_KEYS.devices}-${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManagedDevice[];
    return Array.isArray(parsed) ? dedupeManagedDevices(parsed) : [];
  } catch {
    return [];
  }
}

function persistDevices(userId: number, devices: ManagedDevice[]) {
  localStorage.setItem(`${APP_STORAGE_KEYS.devices}-${userId}`, JSON.stringify(devices));
}

function resolveDevices(userId: number | null): ManagedDevice[] {
  if (userId == null) return [];
  return loadStoredDevices(userId);
}

export function DevicesProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session.userId;
  const [devices, setDevices] = useState<ManagedDevice[]>(() => resolveDevices(userId));

  useEffect(() => {
    setDevices(resolveDevices(userId));
  }, [userId]);

  useEffect(() => {
    if (userId == null) return;
    persistDevices(userId, devices);
  }, [devices, userId]);

  useEffect(() => {
    if (userId == null) return;

    let cancelled = false;

    async function syncHardwareStatuses() {
      const { scanners, printers } = await probeHardwareDevices();
      if (cancelled) return;

      setDevices((current) => {
        if (current.length === 0) return current;

        return current.map((device) => {
          const status = resolveManagedDeviceStatus(device, scanners, printers);
          return {
            ...device,
            status,
            diagnosticsHealthy: status === "connected",
            diagnosticsStatus: diagnosticsLabelForStatus(device, status),
          };
        });
      });
    }

    void syncHardwareStatuses();
    const timer = window.setInterval(() => {
      void syncHardwareStatuses();
    }, 12_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [userId]);

  const addDevice = useCallback((device: ManagedDevice) => {
    setDevices((current) => {
      if (current.some((entry) => entry.id === device.id || deviceNamesMatch(entry.name, device.name))) {
        return current;
      }
      return [...current, device];
    });
  }, []);

  const addDevices = useCallback((nextDevices: ManagedDevice[]) => {
    setDevices((current) => {
      const additions = nextDevices.filter(
        (device) =>
          !current.some((entry) => entry.id === device.id || deviceNamesMatch(entry.name, device.name)),
      );
      return additions.length > 0 ? [...current, ...additions] : current;
    });
  }, []);

  const updateDevice = useCallback((id: string, patch: Partial<ManagedDevice>) => {
    setDevices((current) =>
      current.map((device) => (device.id === id ? { ...device, ...patch } : device)),
    );
  }, []);

  const getDeviceById = useCallback(
    (id: string) => devices.find((device) => device.id === id),
    [devices],
  );

  const value = useMemo(
    () => ({
      devices,
      addDevice,
      addDevices,
      updateDevice,
      getDeviceById,
    }),
    [devices, addDevice, addDevices, updateDevice, getDeviceById],
  );

  return <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>;
}

export function useDevices() {
  const context = useContext(DevicesContext);
  if (!context) {
    throw new Error("useDevices must be used within DevicesProvider");
  }
  return context;
}
