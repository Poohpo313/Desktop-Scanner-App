"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printService = void 0;
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const util_1 = require("util");
const electron_1 = require("electron");
const url_1 = require("url");
const pdf_lib_1 = require("pdf-lib");
const device_match_1 = require("./device-match");
const scanner_service_1 = require("./scanner.service");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const printerRegistry = new Map();
function stablePrinterId(name) {
    return `printer-${(0, crypto_1.createHash)("sha256").update(name).digest("hex").slice(0, 12)}`;
}
async function runPowerShell(script, timeout = 30000) {
    const { stdout } = await execFileAsync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { timeout, maxBuffer: 4 * 1024 * 1024 });
    return stdout.trim();
}
async function listWindowsPrinters() {
    if (process.platform !== "win32") {
        return [];
    }
    const script = [
        "$ErrorActionPreference = 'SilentlyContinue'",
        "Get-Printer | Select-Object Name, DriverName | ConvertTo-Json -Compress",
    ].join("; ");
    try {
        const output = await runPowerShell(script);
        if (!output)
            return [];
        const parsed = JSON.parse(output);
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
    }
    catch {
        return [];
    }
}
function resolvePrinter(printerId) {
    const registered = printerRegistry.get(printerId);
    if (registered)
        return registered;
    for (const printer of printerRegistry.values()) {
        if (printer.id === printerId || printer.name === printerId) {
            return printer;
        }
    }
    return null;
}
function rankPrintersForScanContext(printers, scannerNames, preferredScannerName) {
    const preferredName = preferredScannerName?.trim() || null;
    return [...printers]
        .map((printer) => {
        const preferredScore = preferredName ? (0, device_match_1.scoreDeviceNameMatch)(printer.name, preferredName) : 0;
        const scannerScore = Math.max(0, ...scannerNames.map((scannerName) => (0, device_match_1.scoreDeviceNameMatch)(printer.name, scannerName)));
        const matchedScanner = scannerNames.find((scannerName) => (0, device_match_1.scoreDeviceNameMatch)(printer.name, scannerName) > 0) ??
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
        if ((0, device_match_1.isVirtualPrinterName)(left.printer.name) !== (0, device_match_1.isVirtualPrinterName)(right.printer.name)) {
            return (0, device_match_1.isVirtualPrinterName)(left.printer.name) ? 1 : -1;
        }
        return left.printer.name.localeCompare(right.printer.name);
    })
        .map((entry) => entry.printer);
}
async function printImageWithPaint(filePath, printerName) {
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
async function printSinglePdfFile(filePath, printerName) {
    const win = new electron_1.BrowserWindow({
        show: false,
        webPreferences: {
            sandbox: true,
        },
    });
    try {
        await new Promise((resolve, reject) => {
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
            void win.loadURL((0, url_1.pathToFileURL)(filePath).href);
        });
        await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error("Print timed out."));
            }, 120_000);
            win.webContents.print({
                silent: true,
                deviceName: printerName,
                printBackground: true,
            }, (success, failureReason) => {
                clearTimeout(timer);
                if (success) {
                    resolve();
                    return;
                }
                reject(new Error(failureReason || "Print failed"));
            });
        });
    }
    finally {
        win.destroy();
    }
}
async function printPdfWithElectron(filePath, printerName) {
    const pdfBytes = (0, fs_1.readFileSync)(filePath);
    const sourceDoc = await pdf_lib_1.PDFDocument.load(pdfBytes);
    const pageCount = sourceDoc.getPageCount();
    if (pageCount <= 1) {
        await printSinglePdfFile(filePath, printerName);
        await waitForPrinterQueueIdle(printerName);
        return;
    }
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
        const singlePageDoc = await pdf_lib_1.PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(sourceDoc, [pageIndex]);
        singlePageDoc.addPage(copiedPage);
        const tempPath = (0, path_1.join)((0, os_1.tmpdir)(), `bukolabs-print-${(0, crypto_1.randomUUID)()}.pdf`);
        (0, fs_1.writeFileSync)(tempPath, await singlePageDoc.save());
        try {
            await printSinglePdfFile(tempPath, printerName);
            await waitForPrinterQueueIdle(printerName);
        }
        finally {
            try {
                (0, fs_1.unlinkSync)(tempPath);
            }
            catch {
                // Ignore cleanup errors.
            }
        }
    }
}
async function waitForPrinterQueueIdle(printerName, timeoutMs = 600_000) {
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
async function printFileToPrinter(filePath, printerName) {
    if (!(0, fs_1.existsSync)(filePath)) {
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
exports.printService = {
    async listPrinters(options) {
        const preferredScannerName = options?.preferredScannerName?.trim() || null;
        const [printers, scannerResult] = await Promise.all([
            listWindowsPrinters(),
            scanner_service_1.scannerService.listDevices().catch(() => ({ devices: [] })),
        ]);
        const scannerNames = scannerResult.devices.map((device) => device.name).filter(Boolean);
        const rankedPrinters = rankPrintersForScanContext(printers, scannerNames, preferredScannerName);
        const preferredPrinter = preferredScannerName
            ? (0, device_match_1.findBestMatchingDevice)(rankedPrinters, preferredScannerName)
            : rankedPrinters.find((printer) => !(0, device_match_1.isVirtualPrinterName)(printer.name)) ?? rankedPrinters[0] ?? null;
        printerRegistry.clear();
        for (const printer of rankedPrinters) {
            printerRegistry.set(printer.id, printer);
        }
        let scannerWarning = null;
        if (preferredScannerName && !preferredPrinter) {
            scannerWarning = `No printer queue matched the scanner used for this document (${preferredScannerName}). Install the print driver for that device or choose another printer.`;
        }
        else if (preferredScannerName && preferredPrinter) {
            scannerWarning = null;
        }
        return {
            printers: rankedPrinters,
            preferredPrinterId: preferredPrinter?.id ?? null,
            preferredScannerName,
            scannerWarning,
        };
    },
    async print(payload) {
        const printer = resolvePrinter(payload.printerId) ??
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
