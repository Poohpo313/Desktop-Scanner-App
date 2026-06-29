import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { useAppMode } from "../../../context/AppModeContext";
import { useDevices } from "../../../context/DevicesContext";
import { useDocuments } from "../../../context/DocumentsContext";
import { useSession } from "../../../context/SessionContext";
import { recordSyncNow } from "../../../lib/lastSyncStorage";
import { rememberLastScanner } from "../../../lib/lastScannerStorage";
import { rememberSaveDirectory, resolveDepartmentSaveDirectory, getDefaultStorageRootCache, resolveSaveDirectories } from "../../../lib/documentStorageConfig";
import { buildSavePlan } from "../../../lib/saveDocumentPlanning";
import { resolveSettings, SETTINGS_UPDATED_EVENT } from "../../../lib/settingsStorage";
import { scanConfigPatchFromSettings } from "../../../lib/settingsScanHelpers";
import { ensureUserStorageRoot } from "../../../lib/ensureUserStorage";
import { persistPendingSavePreview } from "../../../lib/pendingSavePreview";
import { discoverScanners, getInitialScannerList } from "../../../lib/scanScannerDiscovery";
import { scanDeviceToManagedDevice } from "../../devices/devicesData";

import { DocumentSaveSuccessToast } from "./DocumentSaveSuccessToast";
import { DocumentSaveProgressModal } from "./DocumentSaveProgressModal";

import { ChooseLocalSaveFolderModal } from "./modals/ChooseLocalSaveFolderModal";

import { ColorModeModal } from "./modals/ColorModeModal";

import { SelectionModal } from "./modals/SelectionModal";

import { OfflineScanHeader } from "./OfflineScanHeader";

import { OfflineScanStepper } from "./OfflineScanStepper";

import { ScanOfflineNotice } from "./ScanOfflineNotice";

import { getDepartmentSavePath, getResolutionDpi, OFFLINE_DEFAULT_SAVE_NOTES, resolveDepartmentLabel, mapProfileDepartmentToConfig, generateScanFileName } from "./scanOfflineHelpers";

import {

  DEFAULT_SCAN_CONFIG,

  FILE_FORMAT_OPTIONS,

  NAMING_PATTERNS,

  PAPER_SIZES,

  RESOLUTIONS,

  SCAN_PRESETS,

  SCAN_STEPS,

  type OfflineScanConfig,
  type ScanStepId,
  type ScannerDevice,
} from "./scanOfflineData";

import { ConfigureStep } from "./steps/ConfigureStep";

import { PreviewStep } from "./steps/PreviewStep";

import { ScanStep } from "./steps/ScanStep";

import { SaveStep, type SaveFormState } from "./steps/SaveStep";

import { SelectScannerStep } from "./steps/SelectScannerStep";

import { useLocalFilesystem } from "./useLocalFilesystem";

import { usePreviewZoom } from "./usePreviewZoom";

import "../../../styles/scan-offline.css";



type ModalType =

  | "folder"

  | "paper"

  | "color"

  | "resolution"

  | "naming"

  | "format"

  | null;



type ScanLocationState = {
  step?: ScanStepId;
  scannerId?: string;
};

const STEP_IDS = SCAN_STEPS.map((entry) => entry.id);

function resolveInitialScanStep(step?: ScanStepId): ScanStepId {
  if (step && STEP_IDS.includes(step)) return step;
  return "select";
}

function resolveInitialScannerId(scannerId: string | undefined, scanners: ScannerDevice[]): string {
  if (scannerId && scanners.some((scanner) => scanner.id === scannerId)) {
    return scannerId;
  }
  return scanners.find((scanner) => scanner.status === "ready")?.id ?? scanners[0]?.id ?? "";
}



export function OfflineScanPage() {

  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as ScanLocationState | null) ?? {};

  const { isOnline } = useAppMode();
  const { devices, addDevice } = useDevices();
  const { addDocument, documents } = useDocuments();
  const { markWorkspaceUsed, session } = useSession();

  const [scanners, setScanners] = useState<ScannerDevice[]>(() => getInitialScannerList(devices));

  const { getQuickLocations } = useLocalFilesystem();

  const { zoom, zoomLabel, zoomIn, zoomOut, fitToPage, previewStyle, stageStyle } = usePreviewZoom();

  const [step, setStep] = useState<ScanStepId>(() => resolveInitialScanStep(routeState.step));

  const [scannerId, setScannerId] = useState(() =>
    resolveInitialScannerId(routeState.scannerId, getInitialScannerList(devices)),
  );

  const [config, setConfig] = useState<OfflineScanConfig>(DEFAULT_SCAN_CONFIG);

  const [saveForm, setSaveForm] = useState<SaveFormState>(() => ({
    fileName: "",
    notes: isOnline ? "" : OFFLINE_DEFAULT_SAVE_NOTES,
    saveLocallyOnly: !isOnline,
    cloudSync: isOnline,
    addToRecords: isOnline,
  }));

  const [modal, setModal] = useState<ModalType>(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [saveToastMode, setSaveToastMode] = useState<"document" | "print">("document");
  const [pendingPrintAfterSave, setPendingPrintAfterSave] = useState<{
    documentId: string;
    scannerId: string;
    scannerName: string;
  } | null>(null);

  const [refreshingScanners, setRefreshingScanners] = useState(false);

  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);
  const [scanPages, setScanPages] = useState<ArrayBuffer[]>([]);
  const [scanPreviewUrls, setScanPreviewUrls] = useState<string[]>([]);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [batchAwaitingNext, setBatchAwaitingNext] = useState(false);
  const scanPreviewUrlsRef = useRef<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<"idle" | "starting" | "scanning" | "complete" | "error">("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedDocumentId, setLastSavedDocumentId] = useState<string | null>(null);
  const [lastSavedFolder, setLastSavedFolder] = useState<string | null>(null);
  const [saveDestinationPreview, setSaveDestinationPreview] = useState("");
  const previousStep = useRef<ScanStepId>(step);
  const departmentFromProfileApplied = useRef(false);

  useEffect(() => {
    scanPreviewUrlsRef.current = scanPreviewUrls;
  }, [scanPreviewUrls]);

  useEffect(() => {
    return () => {
      scanPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const scanPreviewUrl = scanPreviewUrls[previewPageIndex] ?? null;
  const scanPageCount = scanPages.length;

  useEffect(() => {
    const settings = resolveSettings(session.userId);
    const departmentLabel = resolveDepartmentLabel({
      departmentId: config.departmentId,
      customDepartmentLabel: config.customDepartmentLabel,
    });
    const savePath = resolveDepartmentSaveDirectory(
      settings,
      config.departmentId,
      departmentLabel,
      session.userId,
    );

    setConfig((current) => ({
      ...current,
      ...scanConfigPatchFromSettings(settings),
      savePath: current.savePath.trim() || savePath,
    }));

    setSaveForm((current) => ({
      ...current,
      cloudSync:
        settings.saveMode === "local-cloud-sync"
          ? settings.cloudSync && isOnline
          : current.cloudSync,
      addToRecords: true,
    }));
  }, [config.customDepartmentLabel, config.departmentId, isOnline, session.userId]);

  useEffect(() => {
    if (session.userId == null) return;

    function applySettingsFromStorage() {
      const settings = resolveSettings(session.userId);
      setConfig((current) => ({
        ...current,
        ...scanConfigPatchFromSettings(settings),
      }));
    }

    applySettingsFromStorage();
    window.addEventListener(SETTINGS_UPDATED_EVENT, applySettingsFromStorage);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, applySettingsFromStorage);
  }, [session.userId]);

  useEffect(() => {
    if (session.userId == null) return;
    void ensureUserStorageRoot(session.userId);
  }, [session.userId]);

  useEffect(() => {
    if (!session.token || departmentFromProfileApplied.current || !window.bukolabs?.auth) {
      return;
    }

    void window.bukolabs.auth.getProfile({ token: session.token }).then((result) => {
      if (!result?.success || !result.profile) return;

      const mapped = mapProfileDepartmentToConfig(result.profile.department);
      if (!mapped) return;

      departmentFromProfileApplied.current = true;
      setConfig((current) => ({
        ...current,
        departmentId: mapped.departmentId,
        customDepartmentLabel: mapped.customDepartmentLabel,
        savePath: current.savePath.trim() || getDepartmentSavePath(mapped),
      }));
    });
  }, [session.token]);

  useEffect(() => {
    if (step !== "save") return;

    setSaveForm((current) => {
      if (current.fileName.trim()) return current;
      return { ...current, fileName: generateScanFileName(config) };
    });
  }, [step, config]);

  useEffect(() => {
    if (step !== "save") return;
    const settings = resolveSettings(session.userId);
    const plan = buildSavePlan(settings, config, documents, {
      isOnline,
      manualFolder: config.savePath,
      userId: session.userId,
      proposedFileName: saveForm.fileName.trim() || generateScanFileName(config),
    });
    setSaveForm((current) => {
      const previewName = current.fileName.trim() || plan.fileName || "your-file-name";
      setSaveDestinationPreview(
        plan.directories.map((dir) => `${dir}\\${previewName}`).join(" | "),
      );
      return {
        ...current,
        cloudSync: plan.cloudSync,
      };
    });
  }, [config, documents, isOnline, saveForm.fileName, session.userId, step]);

  const appendScanPage = useCallback((buffer: ArrayBuffer) => {
    const bufferCopy = buffer.slice(0);
    setScanPages((current) => [...current, bufferCopy]);
    const url = URL.createObjectURL(new Blob([bufferCopy], { type: "image/jpeg" }));
    setScanPreviewUrls((current) => [...current, url]);
  }, []);

  const setSingleScanPage = useCallback((buffer: ArrayBuffer) => {
    const bufferCopy = buffer.slice(0);
    setScanPreviewUrls((current) => {
      current.forEach((url) => URL.revokeObjectURL(url));
      return [URL.createObjectURL(new Blob([bufferCopy], { type: "image/jpeg" }))];
    });
    setScanPages([bufferCopy]);
    setPreviewPageIndex(0);
  }, []);

  const clearScanPages = useCallback(() => {
    setScanPages([]);
    setScanPreviewUrls((current) => {
      current.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setPreviewPageIndex(0);
    setBatchAwaitingNext(false);
  }, []);

  const performScan = useCallback(async () => {
    if (!window.bukolabs || !scannerId) {
      setScanError("Scanner unavailable. Select a device and try again.");
      return;
    }

    setScanning(true);
    setScanPhase("starting");
    setScanError(null);

    try {
      const selected = scanners.find((entry) => entry.id === scannerId);
      if (!selected || selected.status !== "ready") {
        setScanError("Selected scanner is not ready. Refresh the list or choose another device.");
        setScanPhase("error");
        return;
      }

      const fileType =
        config.fileFormat === "jpeg" ? "jpeg" : config.fileFormat === "png" ? "png" : "pdf";

      setScanPhase("scanning");

      const result = (await window.bukolabs.scanner.startScan({
        deviceId: selected.name,
        settings: {
          resolution: getResolutionDpi(config.resolutionId),
          colorMode: config.colorModeId,
          format: fileType,
          pageSize: config.paperSizeId,
          source: config.scanSource,
        },
      })) as { imageBuffer?: ArrayBuffer; deviceName?: string };

      if (!result?.imageBuffer) {
        setScanError("Scan returned no image. Check the scanner connection and try again.");
        setScanPhase("error");
        return;
      }

      if (config.scanMode === "batch") {
        appendScanPage(result.imageBuffer);
        setBatchAwaitingNext(true);
      } else {
        setSingleScanPage(result.imageBuffer);
        setBatchAwaitingNext(false);
      }

      setScanPhase("complete");
      rememberLastScanner({
        id: scannerId,
        name: result.deviceName ?? selected.name,
      });

      if (session.userId != null) {
        const managed =
          devices.find((entry) => entry.id === scannerId) ??
          scanDeviceToManagedDevice({
            id: scannerId,
            name: selected.name,
            type: selected.type.toLowerCase().includes("multifunction") ? "multifunction" : "scanner",
            driver: "WIA",
            connection: selected.connection,
          });

        if (!devices.some((entry) => entry.id === managed.id)) {
          addDevice(managed);
        }

        void window.bukolabs.devices?.register({
          deviceName: managed.name,
          deviceType: managed.kind,
          serialNumber: managed.serialNumber,
          assignedUser: session.userId,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Scan failed. Check your scanner connection and try again.";
      setScanError(message);
      setScanPhase("error");
    } finally {
      setScanning(false);
    }
  }, [
    addDevice,
    appendScanPage,
    setSingleScanPage,
    config.colorModeId,
    config.fileFormat,
    config.paperSizeId,
    config.resolutionId,
    config.scanMode,
    config.scanSource,
    devices,
    scannerId,
    scanners,
    session.userId,
  ]);

  useEffect(() => {
    if (
      step === "scan" &&
      previousStep.current !== "scan" &&
      scanPhase === "idle" &&
      scanPages.length === 0 &&
      !batchAwaitingNext
    ) {
      void performScan();
    }
    previousStep.current = step;
  }, [batchAwaitingNext, performScan, scanPages.length, scanPhase, step]);



  const showNotice = useCallback((message: string) => {

    setNotice(message);

  }, []);



  useEffect(() => {
    void discoverScanners(devices).then((next) => {
      setScanners(next);
      setScannerId((current) => {
        if (next.some((entry) => entry.id === current)) return current;

        const managed = devices.find((device) => device.id === current);
        if (managed) {
          const byName = next.find(
            (entry) => entry.name.toLowerCase() === managed.name.toLowerCase(),
          );
          if (byName) return byName.id;
        }

        return resolveInitialScannerId(undefined, next);
      });
    });
  }, [devices]);

  useEffect(() => {
    if (routeState.scannerId && scanners.some((scanner) => scanner.id === routeState.scannerId)) {
      setScannerId(routeState.scannerId);
    }
  }, [routeState.scannerId, scanners]);

  useEffect(() => {
    if (!scanners.some((scanner) => scanner.id === scannerId)) {
      setScannerId(resolveInitialScannerId(undefined, scanners));
    }
  }, [scannerId, scanners]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(null), 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (step !== "configure" && step !== "save") {
      persistPendingSavePreview(null);
      return;
    }

    const savePath = config.savePath.trim() || getDepartmentSavePath(config);
    persistPendingSavePreview({
      fileName: saveForm.fileName,
      savePath,
      departmentId: config.departmentId,
      department: resolveDepartmentLabel(config),
    });
  }, [step, config, saveForm.fileName]);



  useEffect(() => {
    if (!isOnline) {
      setConfig((current) => ({
        ...current,
        savePath: current.savePath || getDepartmentSavePath(current),
      }));
      return;
    }

    let cancelled = false;

    async function setDefaultSavePath() {
      const { locations } = await getQuickLocations();
      if (cancelled) return;

      const documents = locations.find((loc) => loc.id === "documents") ?? locations[0];
      if (documents?.path) {
        setConfig((current) =>
          current.savePath ? current : { ...current, savePath: documents.path },
        );
      }
    }

    void setDefaultSavePath();

    return () => {
      cancelled = true;
    };
  }, [getQuickLocations, isOnline]);



  function updateConfig(patch: Partial<OfflineScanConfig>) {
    setConfig((current) => {
      const next = { ...current, ...patch };

      if (patch.departmentId !== undefined || patch.customDepartmentLabel !== undefined) {
        if (!isOnline) {
          next.savePath = getDepartmentSavePath(next);
        }

        if (patch.departmentId && patch.departmentId !== "others") {
          next.customDepartmentLabel = "";
        }
      }

      return next;
    });
  }



  function navigateToSavedDocument(documentId: string) {
    markWorkspaceUsed();
    navigate("/files", {
      replace: true,
      state: {
        folderId: "all",
        selectedDocumentId: documentId,
      },
    });
  }

  function finishSave() {
    setShowSuccessToast(false);

    if (saveToastMode === "print" && pendingPrintAfterSave) {
      navigate("/print", {
        state: {
          source: "documents",
          selectedDocumentId: pendingPrintAfterSave.documentId,
          returnTo: "documents",
          scannerDeviceId: pendingPrintAfterSave.scannerId,
          scannerDeviceName: pendingPrintAfterSave.scannerName,
        },
      });
      setPendingPrintAfterSave(null);
      return;
    }

    if (lastSavedDocumentId) {
      navigateToSavedDocument(lastSavedDocumentId);
    }
  }



  async function saveCurrentDocument() {
    if (!scanPages.length || session.userId == null || !window.bukolabs) {
      throw new Error("Missing scan data or session");
    }

    const settings = resolveSettings(session.userId);
    const proposedName = saveForm.fileName.trim() || generateScanFileName(config);
    const plan = buildSavePlan(settings, config, documents, {
      isOnline,
      manualFolder: config.savePath,
      userId: session.userId,
      proposedFileName: proposedName,
    });

    if (plan.askFolder && !config.savePath.trim()) {
      setModal("folder");
      throw new Error("Choose a save folder before saving.");
    }

    let storageRoot = getDefaultStorageRootCache();
    if (!storageRoot && window.bukolabs?.filesystem?.ensureDefaultStorageRoot) {
      const ensured = await window.bukolabs.filesystem.ensureDefaultStorageRoot();
      storageRoot = ensured.path ?? null;
    }
    if (!storageRoot) {
      storageRoot = await ensureUserStorageRoot(session.userId);
    }
    if (!storageRoot) {
      throw new Error("Could not resolve a save folder on this computer.");
    }

    const directories = resolveSaveDirectories(plan.directories, storageRoot);

    const ext =
      scanPages.length > 1
        ? "pdf"
        : config.fileFormat === "jpeg"
          ? "jpeg"
          : config.fileFormat === "png"
            ? "png"
            : "pdf";
    const baseName = plan.fileName.replace(/\.[^.\\]+$/, "") || "Scan";

    let primaryPath: string | undefined;
    let savedFileName = plan.fileName;

    for (const directory of directories) {
      const ensured = await window.bukolabs.filesystem.ensureDirectory({ path: directory });
      if (!ensured.success) {
        throw new Error(ensured.error ?? "Could not create save folder.");
      }

      const validation = await window.bukolabs.filesystem.validateDirectory({ path: directory });
      if (!validation.valid) {
        throw new Error(validation.error ?? "Save folder is not writable.");
      }
    }

    const saved = (await window.bukolabs.files.save({
      imageBuffers: scanPages.map((page) => page.slice(0)),
      filename: baseName,
      userId: session.userId,
      fileType: ext,
      exportFolder: directories[0],
      skipOcr: !config.ocrEnabled,
    })) as { filePath?: string; ocrText?: string; fileName?: string };

    primaryPath = saved.filePath;
    savedFileName = saved.fileName ?? plan.fileName;

    if (directories.length > 1 && primaryPath && window.bukolabs.filesystem.resolveUniqueFilePath) {
      const secondary = directories[1];
      await window.bukolabs.filesystem.ensureDirectory({ path: secondary });
      const unique = await window.bukolabs.filesystem.resolveUniqueFilePath({
        dirPath: secondary,
        fileName: savedFileName,
      });
      const bufferCopy = scanPages.map((page) => page.slice(0));
      await window.bukolabs.files.save({
        imageBuffers: bufferCopy,
        filename: unique.fileName.replace(/\.[^.\\]+$/, ""),
        userId: session.userId,
        fileType: ext,
        exportFolder: secondary,
        skipOcr: true,
      });
    }

    persistPendingSavePreview(null);

    if (primaryPath) {
      rememberSaveDirectory(session.userId, primaryPath);
      setLastSavedFolder(primaryPath.replace(/[/\\][^/\\]+$/, ""));
    }

    if (plan.cloudSync && isOnline) {
      void window.bukolabs.sync.trigger();
      recordSyncNow(session.userId);
    }

    if (!isOnline || plan.addToRecords) {
      const entry = addDocument({
        fileName: savedFileName,
        pages: scanPages.length,
        departmentId: config.departmentId,
        customDepartmentLabel: config.customDepartmentLabel,
        fileFormat: scanPages.length > 1 ? "pdf" : config.fileFormat,
        savePath: primaryPath ?? directories[0],
        cloudSync: plan.cloudSync,
        notes: saveForm.notes,
        ocrText: saved.ocrText,
        fileSizeBytes: scanPages.reduce((total, page) => total + page.byteLength, 0),
      });

      setLastSavedDocumentId(entry.id);
      return entry;
    }

    setLastSavedDocumentId(null);
    return null;
  }

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    try {
      const entry = await saveCurrentDocument();
      if (!entry) {
        showNotice("Document saved to your selected folder.");
        return;
      }

      setSaveToastMode("document");
      navigateToSavedDocument(entry.id);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save document. Check the save folder and try again.";
      showNotice(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndPrint() {
    if (saving) return;

    setSaving(true);
    try {
      const saved = await saveCurrentDocument();
      if (!saved) {
        showNotice("Document saved to folder. Enable document records to print from the app library.");
        return;
      }

      const selectedScanner = scanners.find((entry) => entry.id === scannerId);
      const scannerName = selectedScanner?.name ?? scannerId;
      rememberLastScanner({
        id: scannerId,
        name: scannerName,
      });

      setLastSavedDocumentId(saved.id);
      setSaveToastMode("print");
      setPendingPrintAfterSave({
        documentId: saved.id,
        scannerId,
        scannerName,
      });
      setShowSuccessToast(true);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save document before printing.";
      showNotice(message);
    } finally {
      setSaving(false);
    }
  }

  function handleRescan() {
    clearScanPages();
    setScanError(null);
    setScanPhase("idle");
    setStep("scan");
    window.setTimeout(() => {
      void performScan();
    }, 0);
  }

  function handleNextBatchPage() {
    setBatchAwaitingNext(false);
    setScanPhase("idle");
    void performScan();
  }

  function handleStopBatch() {
    setBatchAwaitingNext(false);
    setScanPhase("complete");
  }

  function handleDeletePreviewPage() {
    const index = previewPageIndex;
    const remainingCount = scanPageCount - 1;

    setScanPreviewUrls((urls) => {
      const removed = urls[index];
      if (removed) URL.revokeObjectURL(removed);
      return urls.filter((_, pageIndex) => pageIndex !== index);
    });
    setScanPages((pages) => pages.filter((_, pageIndex) => pageIndex !== index));
    setPreviewPageIndex((current) => {
      if (remainingCount <= 0) return 0;
      if (current > index) return current - 1;
      if (current >= remainingCount) return Math.max(0, remainingCount - 1);
      return current;
    });
    setScanError(null);
    setBatchAwaitingNext(remainingCount > 0);
    setScanPhase(remainingCount > 0 ? "complete" : "idle");
    setStep("scan");
    showNotice(
      remainingCount > 0
        ? "Page removed. Scan a replacement or continue with the remaining pages."
        : "Page removed. Scan again when you are ready.",
    );
  }



  async function handleRefreshScanners() {
    setRefreshingScanners(true);

    try {
      const previousIds = new Set(scanners.map((scanner) => scanner.id));
      const next = await discoverScanners(devices);
      setScanners(next);

      if (!next.some((scanner) => scanner.id === scannerId)) {
        setScannerId(resolveInitialScannerId(undefined, next));
      }

      const addedCount = next.filter((scanner) => !previousIds.has(scanner.id)).length;
      const readyCount = next.filter((scanner) => scanner.status === "ready").length;

      if (addedCount > 0) {
        showNotice(
          `Found ${next.length} scanner${next.length === 1 ? "" : "s"} (${addedCount} newly added).`,
        );
      } else if (readyCount > 0) {
        showNotice(`Scanner list refreshed. ${readyCount} ready to scan.`);
      } else {
        showNotice("No connected scanners detected. Check device connections in Devices.");
      }
    } finally {
      setRefreshingScanners(false);
    }
  }



  function handleApplyPreset(preset: string) {

    const patch = SCAN_PRESETS[preset];

    if (!patch) return;

    updateConfig(patch);

    setActivePreset(preset);

    showNotice(`${preset} preset applied.`);

  }



  function handleStepClick(target: ScanStepId) {
    const targetIndex = STEP_IDS.indexOf(target);
    const currentIndex = STEP_IDS.indexOf(step);

    if (targetIndex <= currentIndex) {
      setStep(target);
    }
  }



  useEffect(() => {
    if (!showSuccessToast || saveToastMode !== "print") return;

    const timer = window.setTimeout(() => {
      finishSave();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [showSuccessToast, saveToastMode, pendingPrintAfterSave]);



  const screenSlug = isOnline
    ? step === "select"
      ? "section-03-scan"
      : step === "configure"
        ? "section-03-scan-configure"
        : step === "scan"
          ? "section-03-scan-scan"
          : step === "preview"
            ? "section-03-scan-preview"
            : "section-03-scan-save"
    : step === "select"
      ? "section-screen-1-select-scanner-offline"
      : step === "configure"
        ? "section-screen-2-configure-offline"
        : step === "scan"
          ? "section-screen-3-scan-offline"
          : step === "preview"
            ? "section-screen-4-preview-offline"
            : "section-screen-5-save-offline";

  return (
    <div
      className={`scan-offline-page${isOnline ? " scan-offline-page--online" : " scan-offline-page--offline"}`}
      data-screen={screenSlug}
    >

      <OfflineScanHeader step={step} />

      <OfflineScanStepper current={step} onStepClick={handleStepClick} />



      <div className="scan-offline-page__content">

        {step === "select" ? (

          <SelectScannerStep
            isOnline={isOnline}
            scanners={scanners}
            selectedId={scannerId}

            refreshing={refreshingScanners}

            onSelect={setScannerId}

            onRefresh={handleRefreshScanners}

            onNext={() => setStep("configure")}

          />

        ) : null}



        {step === "configure" ? (

          <ConfigureStep
            isOnline={isOnline}
            config={config}
            scanners={scanners}
            scannerId={scannerId}
            activePreset={activePreset}
            onChange={updateConfig}
            onBack={() => setStep("select")}
            onNext={() => setStep("scan")}
            onOpenScanner={() => setStep("select")}
            onOpenFolder={() => setModal("folder")}
            onOpenPaperSize={() => setModal("paper")}
            onOpenColorMode={() => setModal("color")}
            onOpenResolution={() => setModal("resolution")}
            onOpenNamingPattern={() => setModal("naming")}
            onApplyPreset={handleApplyPreset}
            onRetryScannerConnection={() => void handleRefreshScanners()}
            refreshingScanners={refreshingScanners}
          />

        ) : null}



        {step === "scan" ? (
          <ScanStep
            isOnline={isOnline}
            config={config}
            scanners={scanners}
            scannerId={scannerId}
            scanning={scanning}
            scanPhase={scanPhase}
            scanError={scanError}
            scanComplete={scanPhase === "complete" && scanPageCount > 0 && !batchAwaitingNext}
            pageCount={scanPageCount}
            batchAwaitingNext={batchAwaitingNext}
            onBack={() => setStep("configure")}
            onNext={() => {
              setPreviewPageIndex(0);
              setStep("preview");
            }}
            onStartScan={() => void performScan()}
            onNextPage={handleNextBatchPage}
            onStopBatch={handleStopBatch}
            onRetryScannerConnection={() => void handleRefreshScanners()}
            refreshingScanners={refreshingScanners}
          />
        ) : null}



        {step === "preview" ? (

          <PreviewStep
            isOnline={isOnline}
            config={config}
            scanners={scanners}
            scannerId={scannerId}
            zoomLabel={zoomLabel}
            previewStyle={previewStyle}
            stageStyle={stageStyle}
            scanImageUrl={scanPreviewUrl}
            pageCount={scanPageCount}
            currentPage={previewPageIndex + 1}
            onPageChange={(page) => setPreviewPageIndex(Math.max(0, page - 1))}
            onBack={() => setStep("scan")}
            onNext={() => setStep("save")}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitToPage={fitToPage}
            onRetryScannerConnection={() => void handleRefreshScanners()}
            refreshingScanners={refreshingScanners}
            allowDeletePage={config.scanMode === "batch"}
            onDeletePage={handleDeletePreviewPage}
          />

        ) : null}



        {step === "save" ? (

          <SaveStep
            isOnline={isOnline}
            config={config}
            scanners={scanners}
            scannerId={scannerId}
            saveForm={saveForm}
            scanPreviewUrl={scanPreviewUrl}
            scanning={scanning}
            saving={saving}
            canSave={scanPageCount > 0 && session.userId != null && saveForm.fileName.trim().length > 0}
            onChange={(patch) => setSaveForm((current) => ({ ...current, ...patch }))}

            onBack={() => setStep("preview")}

            onSave={handleSave}
            saveDestinationPreview={saveDestinationPreview}

            onRescan={handleRescan}

            onBrowse={() => setModal("folder")}

            onOpenFileFormat={() => setModal("format")}

            onCloudSyncInfo={() =>
              showNotice("Cloud Sync is available when you reconnect to the internet.")
            }

            onSaveAndPrint={handleSaveAndPrint}
            onRetryScannerConnection={() => void handleRefreshScanners()}
            refreshingScanners={refreshingScanners}
          />

        ) : null}

      </div>

      {notice ? <ScanOfflineNotice message={notice} onDismiss={() => setNotice(null)} /> : null}

      {saving ? <DocumentSaveProgressModal ocrEnabled={config.ocrEnabled} /> : null}

      {showSuccessToast && saveToastMode === "print" ? (
        <DocumentSaveSuccessToast
          label="FILES SAVED"
          title="Files saved"
          description="Your document was saved. Opening print settings…"
          onClose={finishSave}
        />
      ) : null}



      {modal === "folder" ? (

        <ChooseLocalSaveFolderModal

          value={config.savePath}

          onApply={(path) => updateConfig({ savePath: path })}

          onClose={() => setModal(null)}

        />

      ) : null}



      {modal === "paper" ? (

        <SelectionModal

          title="Bond Paper Size"

          options={PAPER_SIZES.map((paper) => ({
            id: paper.id,
            label: paper.label,
            description: paper.description?.split(" — ")[0],
          }))}

          value={config.paperSizeId}

          summaryLabel="Selected size"

          onApply={(id) => updateConfig({ paperSizeId: id })}

          onClose={() => setModal(null)}

        />

      ) : null}



      {modal === "color" ? (

        <ColorModeModal

          value={config.colorModeId}

          onApply={(id) => updateConfig({ colorModeId: id })}

          onClose={() => setModal(null)}

        />

      ) : null}



      {modal === "resolution" ? (

        <SelectionModal

          title="Resolution"

          options={RESOLUTIONS}

          value={config.resolutionId}

          onApply={(id) => updateConfig({ resolutionId: id })}

          onClose={() => setModal(null)}

        />

      ) : null}



      {modal === "naming" ? (

        <SelectionModal

          title="File Naming Pattern"

          options={NAMING_PATTERNS}

          value={config.namingPattern}

          summaryLabel="Selected pattern"

          onApply={(id) => updateConfig({ namingPattern: id })}

          onClose={() => setModal(null)}

        />

      ) : null}



      {modal === "format" ? (

        <SelectionModal

          title="File Format"

          options={FILE_FORMAT_OPTIONS}

          value={config.fileFormat}

          summaryLabel="Selected format"

          onApply={(id) => updateConfig({ fileFormat: id as OfflineScanConfig["fileFormat"] })}

          onClose={() => setModal(null)}

        />

      ) : null}

    </div>

  );

}

