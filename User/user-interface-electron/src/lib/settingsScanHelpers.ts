import {
  getBondPaperSizeDisplay,
  getColorModeLabel,
  getResolutionLabel,
} from "../components/scan/offline/scanOfflineHelpers";
import type { AppSettings } from "../components/settings/settingsData";
import { syncSavePreferenceFields } from "./savePreferencesHelpers";
import { normalizeTheme } from "./appTheme";

export function getDefaultScannerLabel(
  scannerId: string,
  scanners: { id: string; name: string }[],
): string {
  return scanners.find((scanner) => scanner.id === scannerId)?.name ?? "No scanner selected";
}

export function syncScanDisplayFields(settings: AppSettings): AppSettings {
  return {
    ...settings,
    scanPaperSize: getBondPaperSizeDisplay(settings.scanPaperSizeId),
    scanColorMode: getColorModeLabel(settings.scanColorModeId),
    scanResolution: getResolutionLabel(settings.scanResolutionId),
    scanFileFormat: settings.defaultFileType,
  };
}

export function normalizeAppSettings(settings: AppSettings): AppSettings {
  return syncScanDisplayFields(
    syncSavePreferenceFields({
      ...settings,
      theme: normalizeTheme(settings.theme),
    }),
  );
}

export function scanConfigPatchFromSettings(settings: AppSettings): Partial<import("../components/scan/offline/scanOfflineData").OfflineScanConfig> {
  const fileType = settings.defaultFileType?.toLowerCase() ?? "pdf";
  const namingPattern = settings.saveNamingPattern
    .replace(/\{Department\}/g, "[Department]")
    .replace(/\{Document\}/g, "[Department]")
    .replace(/\{DocumentType\}/g, "[DocumentType]")
    .replace(/\{Date\}/g, "[Date]")
    .replace(/\{Time\}/g, "[Time]")
    .replace(/\{Counter\}/g, "[Sequence]")
    .replace(/\{Sequence\}/g, "[Sequence]");

  return {
    paperSizeId: settings.scanPaperSizeId || "a4",
    colorModeId: settings.scanColorModeId || "color",
    resolutionId: settings.scanResolutionId || "300",
    duplex: settings.scanDuplex ? "double" : "single",
    fileFormat:
      fileType === "png" ? "png" : fileType === "jpeg" || fileType === "jpg" ? "jpeg" : "pdf",
    ocrEnabled: settings.ocrEnabled && settings.ocrAutoOnScan,
    namingPattern: namingPattern || "[Department]_[Date]_[Time]",
  };
}

export function getDefaultScanProfilePatch(): Partial<AppSettings> {
  return {
    scanDefaultScannerId: "",
    scanPaperSizeId: "a4",
    scanColorModeId: "color",
    scanResolutionId: "300",
    scanDuplex: false,
    scanAutoCrop: true,
    scanBlankPageRemoval: false,
    scanAutoDeskew: true,
    scanBrightness: 0,
    scanContrast: 0,
    defaultFileType: "PDF",
    saveNamingPattern: "{Department}_{Date}_{Time}",
    ocrAutoOnScan: true,
    autoOpenAfterScan: false,
  };
}
