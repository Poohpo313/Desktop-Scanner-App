import { useEffect, useMemo, useState } from "react";
import { isScanCapableDevice } from "../components/devices/devicesData";
import { useDevices } from "../context/DevicesContext";
import { useSession } from "../context/SessionContext";
import {
  countLivePrinters,
  countLiveScanners,
  probeHardwareDevices,
} from "../lib/deviceHardwareSync";

const HARDWARE_POLL_MS = 12_000;

export function useWorkspaceStatus() {
  const { devices } = useDevices();
  const { session } = useSession();
  const [liveScannerCount, setLiveScannerCount] = useState(0);
  const [livePrinterCount, setLivePrinterCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function refreshHardware() {
      const { scanners, printers } = await probeHardwareDevices();
      if (cancelled) return;
      setLiveScannerCount(countLiveScanners(scanners));
      setLivePrinterCount(countLivePrinters(printers));
    }

    void refreshHardware();
    const timer = window.setInterval(() => {
      void refreshHardware();
    }, HARDWARE_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return useMemo(() => {
    const managedScannerConnected = devices.some(
      (device) => isScanCapableDevice(device) && device.status === "connected",
    );
    const managedPrinterConnected = devices.some(
      (device) => device.kind === "printer" && device.status === "connected",
    );

    const scannerConnected = liveScannerCount > 0 || managedScannerConnected;
    const printerConnected = livePrinterCount > 0 || managedPrinterConnected;
    const licenseActive = Boolean(session.token);

    return { scannerConnected, printerConnected, licenseActive };
  }, [devices, livePrinterCount, liveScannerCount, session.token]);
}
