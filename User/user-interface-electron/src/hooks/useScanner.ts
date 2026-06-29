import { useCallback, useState } from "react";

export type ScanDevice = {
  id: string;
  name: string;
  type: string;
  driver: string;
  connection?: string;
};
export type ScanCapabilities = {
  dpi: number[];
  colorModes: string[];
  pageSizes: string[];
  hasADF: boolean;
  hasDuplex: boolean;
};

export type ScanSettings = {
  colorMode: string;
  resolution: number;
  pageSize: string;
  format: "pdf" | "png";
  source: "Flatbed" | "ADF";
  deskew: boolean;
  autoCrop: boolean;
  blankPageRemoval: boolean;
};

const defaultSettings: ScanSettings = {
  colorMode: "Auto",
  resolution: 300,
  pageSize: "A4",
  format: "png",
  source: "Flatbed",
  deskew: true,
  autoCrop: true,
  blankPageRemoval: false,
};

export function useScanner() {
  const [devices, setDevices] = useState<ScanDevice[]>([]);
  const [capabilities, setCapabilities] = useState<ScanCapabilities | null>(null);
  const [settings, setSettings] = useState<ScanSettings>(defaultSettings);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<ArrayBuffer | null>(null);
  const [previewFormat, setPreviewFormat] = useState<"png" | "pdf">("png");

  const loadDevices = useCallback(async () => {
    const res = (await window.bukolabs?.scanner.listDevices()) as {
      devices?: ScanDevice[];
    };
    setDevices(res?.devices ?? []);
    return res?.devices ?? [];
  }, []);

  const loadCapabilities = useCallback(async (deviceId: string) => {
    const res = (await window.bukolabs?.scanner.getCapabilities(deviceId)) as ScanCapabilities;
    setCapabilities(res);
    return res;
  }, []);

  const startScan = useCallback(
    async (deviceId: string) => {
      setScanning(true);
      try {
        const res = (await window.bukolabs?.scanner.startScan({
          deviceId,
          settings: settings as unknown as Record<string, unknown>,
        })) as { imageBuffer?: ArrayBuffer; format?: string };
        if (res?.imageBuffer) {
          setPreview(res.imageBuffer);
          setPreviewFormat(res.format === "pdf" ? "pdf" : "png");
        }
        return res;
      } finally {
        setScanning(false);
      }
    },
    [settings]
  );

  const cancelScan = useCallback(async () => {
    await window.bukolabs?.scanner.cancelScan();
    setScanning(false);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    devices,
    capabilities,
    settings,
    setSettings,
    scanning,
    preview,
    previewFormat,
    loadDevices,
    loadCapabilities,
    startScan,
    cancelScan,
    clearPreview,
  };
}
