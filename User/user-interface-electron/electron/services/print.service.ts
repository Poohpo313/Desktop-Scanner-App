import { execFile } from "child_process";
import { createHash, randomUUID } from "crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import { BrowserWindow } from "electron";
import { pathToFileURL } from "url";
import { PDFDocument } from "pdf-lib";
import {
  findBestMatchingDevice,
  isVirtualPrinterName,
  scoreDeviceNameMatch,
} from "./device-match";
import { scannerService } from "./scanner.service";

const execFileAsync = promisify(execFile);

export type PrinterRecord = {
  id: string;
  name: string;
  type: string;
  driver: string;
  matchedScannerName?: string | null;
};

const printerRegistry = new Map<string, PrinterRecord>();

function stablePrinterId(name: string) {
  return `printer-${createHash("sha256").update(name).digest("hex").slice(0, 12)}`;
}

async function runPowerShell(script: string, timeout = 30000) {
  const { stdout } = await execFileAsync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { timeout, maxBuffer: 4 * 1024 * 1024 }
  );
  return stdout.trim();
}

async function listWindowsPrinters(): Promise<PrinterRecord[]> {
  if (process.platform !== "win32") {
    return [];
  }

  const script = [
    "$ErrorActionPreference = 'SilentlyContinue'",
    "Get-Printer | Select-Object Name, DriverName | ConvertTo-Json -Compress",
  ].join("; ");

  try {
    const output = await runPowerShell(script);
    if (!output) return [];

    const parsed = JSON.parse(output) as
      | Array<{ Name?: string; DriverName?: string }>
      | { Name?: string; DriverName?: string };

    const rows = Array.isArray(parsed) ? parsed : [parsed];

    return rows
      .filter((row) => row.Name?.trim())
      .map((row) => {
        const name = String(row.Name).trim();
        const id = stablePrinterId(name);
        return {
          id,
          name,
          type: "printer",
          driver: String(row.DriverName ?? "Windows Spooler"),
        };
      });
  } catch {
    return [];
  }
}

function resolvePrinter(printerId: string) {
  const registered = printerRegistry.get(printerId);
  if (registered) return registered;

  for (const printer of printerRegistry.values()) {
    if (printer.id === printerId || printer.name === printerId) {
      return printer;
    }
  }

  return null;
}

function rankPrintersForScanContext(
  printers: PrinterRecord[],
  scannerNames: string[],
  preferredScannerName?: string | null,
) {
  const preferredName = preferredScannerName?.trim() || null;

  return [...printers]
    .map((printer) => {
      const preferredScore = preferredName ? scoreDeviceNameMatch(printer.name, preferredName) : 0;
      const scannerScore = Math.max(
        0,
        ...scannerNames.map((scannerName) => scoreDeviceNameMatch(printer.name, scannerName)),
      );
      const matchedScanner =
        scannerNames.find((scannerName) => scoreDeviceNameMatch(printer.name, scannerName) > 0) ??
        null;

      return {
        printer: {
          ...printer,
          matchedScannerName: matchedScanner,
        },
        preferredScore,
        scannerScore,
      };
    })
    .sort((left, right) => {
      if (left.preferredScore !== right.preferredScore) {
        return right.preferredScore - left.preferredScore;
      }
      if (left.scannerScore !== right.scannerScore) {
        return right.scannerScore - left.scannerScore;
      }
      if (isVirtualPrinterName(left.printer.name) !== isVirtualPrinterName(right.printer.name)) {
        return isVirtualPrinterName(left.printer.name) ? 1 : -1;
      }
      return left.printer.name.localeCompare(right.printer.name);
    })
    .map((entry) => entry.printer);
}

async function printImageWithPaint(filePath: string, printerName: string) {
  const escapedPath = filePath.replace(/'/g, "''");
  const escapedPrinter = printerName.replace(/'/g, "''");
  const script = [
    "$ErrorActionPreference = 'Stop'",
    `$file = '${escapedPath}'`,
    `$printer = '${escapedPrinter}'`,
    "Start-Process -FilePath 'mspaint.exe' -ArgumentList @('/pt', $file, $printer) -Wait -WindowStyle Hidden",
  ].join("\n");

  await runPowerShell(script, 120000);
}

async function printSinglePdfFile(filePath: string, printerName: string) {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: true,
    },
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Timed out while loading the PDF for printing."));
      }, 60_000);

      win.webContents.once("did-finish-load", () => {
        clearTimeout(timer);
        resolve();
      });
      win.webContents.once("did-fail-load", (_event, _code, description) => {
        clearTimeout(timer);
        reject(new Error(description || "Could not load the PDF for printing."));
      });

      void win.loadURL(pathToFileURL(filePath).href);
    });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Print timed out."));
      }, 120_000);

      win.webContents.print(
        {
          silent: true,
          deviceName: printerName,
          printBackground: true,
        },
        (success, failureReason) => {
          clearTimeout(timer);
          if (success) {
            resolve();
            return;
          }
          reject(new Error(failureReason || "Print failed"));
        },
      );
    });
  } finally {
    win.destroy();
  }
}

async function printPdfWithElectron(filePath: string, printerName: string) {
  const pdfBytes = readFileSync(filePath);
  const sourceDoc = await PDFDocument.load(pdfBytes);
  const pageCount = sourceDoc.getPageCount();

  if (pageCount <= 1) {
    await printSinglePdfFile(filePath, printerName);
    await waitForPrinterQueueIdle(printerName);
    return;
  }

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(sourceDoc, [pageIndex]);
    singlePageDoc.addPage(copiedPage);

    const tempPath = join(tmpdir(), `bukolabs-print-${randomUUID()}.pdf`);
    writeFileSync(tempPath, await singlePageDoc.save());

    try {
      await printSinglePdfFile(tempPath, printerName);
      await waitForPrinterQueueIdle(printerName);
    } finally {
      try {
        unlinkSync(tempPath);
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
}

async function waitForPrinterQueueIdle(printerName: string, timeoutMs = 600_000) {
  if (process.platform !== "win32") {
    return;
  }

  const escapedPrinter = printerName.replace(/'/g, "''");
  const script = [
    "$ErrorActionPreference = 'Stop'",
    `$printer = '${escapedPrinter}'`,
    `$deadline = (Get-Date).AddMilliseconds(${timeoutMs})`,
    "do {",
    "  Start-Sleep -Milliseconds 750",
    "  $jobs = @(Get-PrintJob -PrinterName $printer -ErrorAction SilentlyContinue)",
    "} while ($jobs.Count -gt 0 -and (Get-Date) -lt $deadline)",
    "if ($jobs.Count -gt 0) { throw 'Printing is still in progress on the printer.' }",
  ].join("\n");

  await runPowerShell(script, timeoutMs + 10_000);
}

async function printFileToPrinter(filePath: string, printerName: string) {
  if (!existsSync(filePath)) {
    throw new Error("Document file not found");
  }

  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "png" || extension === "jpg" || extension === "jpeg" || extension === "bmp") {
    await printImageWithPaint(filePath, printerName);
    await waitForPrinterQueueIdle(printerName);
    return;
  }

  if (extension === "pdf") {
    await printPdfWithElectron(filePath, printerName);
    await waitForPrinterQueueIdle(printerName);
    return;
  }

  throw new Error(`Printing is not supported for .${extension} files.`);
}

export const printService = {
  async listPrinters(options?: { preferredScannerName?: string | null }) {
    const preferredScannerName = options?.preferredScannerName?.trim() || null;
    const [printers, scannerResult] = await Promise.all([
      listWindowsPrinters(),
      scannerService.listDevices().catch(() => ({ devices: [] as Array<{ name: string }> })),
    ]);

    const scannerNames = scannerResult.devices.map((device) => device.name).filter(Boolean);
    const rankedPrinters = rankPrintersForScanContext(printers, scannerNames, preferredScannerName);
    const preferredPrinter = preferredScannerName
      ? findBestMatchingDevice(rankedPrinters, preferredScannerName)
      : rankedPrinters.find((printer) => !isVirtualPrinterName(printer.name)) ?? rankedPrinters[0] ?? null;

    printerRegistry.clear();
    for (const printer of rankedPrinters) {
      printerRegistry.set(printer.id, printer);
    }

    let scannerWarning: string | null = null;
    if (preferredScannerName && !preferredPrinter) {
      scannerWarning = `No printer queue matched the scanner used for this document (${preferredScannerName}). Install the print driver for that device or choose another printer.`;
    } else if (preferredScannerName && preferredPrinter) {
      scannerWarning = null;
    }

    return {
      printers: rankedPrinters,
      preferredPrinterId: preferredPrinter?.id ?? null,
      preferredScannerName,
      scannerWarning,
    };
  },

  async print(payload: {
    printerId: string;
    documentPath?: string;
    settings: Record<string, unknown>;
  }) {
    const printer =
      resolvePrinter(payload.printerId) ??
      resolvePrinter(String(payload.settings.printerName ?? "")) ??
      null;

    if (!printer) {
      throw new Error("Selected printer was not found. Refresh the printer list and try again.");
    }

    if (!payload.documentPath?.trim()) {
      throw new Error("No document path provided for printing.");
    }

    await printFileToPrinter(payload.documentPath.trim(), printer.name);

    return {
      success: true,
      printerId: printer.id,
      printerName: printer.name,
      message: `Sent to ${printer.name}`,
    };
  },
};
