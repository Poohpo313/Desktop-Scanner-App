import { execFile } from "child_process";
import { createHash } from "crypto";
import { readFileSync, unlinkSync } from "fs";
import { promisify } from "util";
import { deviceNamesMatch } from "./device-match";

const execFileAsync = promisify(execFile);

export type ScanDeviceRecord = {
  id: string;
  name: string;
  type: string;
  driver: string;
  connection?: string;
};

const deviceRegistry = new Map<string, ScanDeviceRecord>();

function stableDeviceId(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

async function runPowerShell(script: string, timeout = 120000) {
  const { stdout } = await execFileAsync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { timeout, maxBuffer: 4 * 1024 * 1024 }
  );
  return stdout.trim();
}

function dedupeScanDevices(devices: ScanDeviceRecord[]): ScanDeviceRecord[] {
  const result: ScanDeviceRecord[] = [];

  for (const device of devices) {
    const matchIndex = result.findIndex((entry) => deviceNamesMatch(entry.name, device.name));
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

async function listWindowsDevices(): Promise<ScanDeviceRecord[]> {
  if (process.platform !== "win32") {
    return [];
  }

  const script = [
    "$ErrorActionPreference = 'SilentlyContinue'",
    "$devices = @()",
    "Get-CimInstance Win32_PnPEntity | Where-Object {",
    "  $_.PNPClass -eq 'Image' -or $_.Name -match 'Scanner|Scan|Imaging|WIA'",
    "} | ForEach-Object {",
    "  $devices += [PSCustomObject]@{ Name = $_.Name; Id = $_.DeviceID; Kind = 'scanner' }",
    "}",
    "try {",
    "  $manager = New-Object -ComObject WIA.DeviceManager",
    "  for ($i = 1; $i -le $manager.DeviceInfos.Count; $i++) {",
    "    $info = $manager.DeviceInfos.Item($i)",
    "    $name = [string]$info.Properties('Name').Value",
    "    if ($name) {",
    "      $devices += [PSCustomObject]@{ Name = $name; Id = $name; Kind = 'scanner' }",
    "    }",
    "  }",
    "} catch {}",
    "$devices | Sort-Object -Property Name -Unique | ConvertTo-Json -Compress",
  ].join("; ");

  try {
    const output = await runPowerShell(script, 15000);
    if (!output) return [];

    const parsed = JSON.parse(output) as
      | Array<{ Name?: string; Id?: string; Kind?: string }>
      | { Name?: string; Id?: string; Kind?: string };

    const rows = Array.isArray(parsed) ? parsed : [parsed];

    return dedupeScanDevices(
      rows
        .filter((row) => row.Name?.trim())
        .map((row, index) => {
          const name = String(row.Name).trim();
          const stable = stableDeviceId(String(row.Id ?? name));
          return {
            id: `dev-${stable}-${index}`,
            name,
            type: "scanner",
            driver: "WIA",
            connection: String(row.Id ?? "").includes("USB") ? "USB" : "System",
          };
        }),
    );
  } catch {
    return [];
  }
}

function resolveDevice(deviceId: string) {
  const registered = deviceRegistry.get(deviceId);
  if (registered) return registered;

  const normalized = deviceId.trim().toLowerCase();
  if (!normalized) return null;

  for (const device of deviceRegistry.values()) {
    if (device.id === deviceId || device.name === deviceId) {
      return device;
    }
  }

  for (const device of deviceRegistry.values()) {
    const name = device.name.trim().toLowerCase();
    if (
      name === normalized ||
      name.includes(normalized) ||
      normalized.includes(name)
    ) {
      return device;
    }
  }

  return null;
}

async function scanWithWia(
  deviceName: string,
  settings: Record<string, unknown> = {},
): Promise<Buffer> {
  const escapedName = deviceName.replace(/'/g, "''");
  const documentHandling = settings.source === "adf" ? 1 : 2;
  const resolution = Number(settings.resolution) || 300;

  const script = [
    "$ErrorActionPreference = 'Stop'",
    `$targetName = '${escapedName}'`,
    `$documentHandling = ${documentHandling}`,
    `$resolution = ${resolution}`,
    "$manager = New-Object -ComObject WIA.DeviceManager",
    "$device = $null",
    "for ($i = 1; $i -le $manager.DeviceInfos.Count; $i++) {",
    "  $info = $manager.DeviceInfos.Item($i)",
    "  $name = [string]$info.Properties('Name').Value",
    "  if ($name -eq $targetName -or $name -like ('*' + $targetName + '*') -or $targetName -like ('*' + $name + '*')) {",
    "    $device = $info.Connect()",
    "    break",
    "  }",
    "}",
    "if (-not $device) { throw \"No WIA scanner matched '$targetName'. Connect the scanner and try again.\" }",
    "if ($device.Items.Count -lt 1) { throw 'Scanner reported no scan items. Reconnect the device and try again.' }",
    "$item = $null",
    "for ($j = 1; $j -le $device.Items.Count; $j++) {",
    "  $candidate = $device.Items.Item($j)",
    "  try {",
    "    $itemName = [string]$candidate.Properties('Item Name').Value",
    "  } catch {",
    "    $itemName = ''",
    "  }",
    "  if ($itemName -match 'Flatbed|Feeder|Scan|Root|Document') {",
    "    $item = $candidate",
    "    break",
    "  }",
    "}",
    "if (-not $item) { $item = $device.Items.Item(1) }",
    "function Set-WiaProperty($target, $propertyId, $value) {",
    "  try {",
    "    $property = $target.Properties.Item($propertyId)",
    "    if ($property.IsReadOnly) { return }",
    "    $property.Value = $value",
    "  } catch {}",
    "}",
    "Set-WiaProperty $item 3088 $documentHandling",
    "Set-WiaProperty $item 6146 1",
    "Set-WiaProperty $item 6147 $resolution",
    "Set-WiaProperty $item 6148 $resolution",
    "$formatIds = @(",
    "  '{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}',",
    "  '{B96B3CAF-0728-11D3-9D7B-0000F81EF32E}',",
    "  '{B96B3CAA-0728-11D3-9D7B-0000F81EF32E}',",
    "  '{B96B3CB1-0728-11D3-9D7B-0000F81EF32E}'",
    ")",
    "$image = $null",
    "foreach ($formatId in $formatIds) {",
    "  try {",
    "    $candidate = $item.Transfer($formatId)",
    "    if ($null -ne $candidate) {",
    "      $image = $candidate",
    "      break",
    "    }",
    "  } catch {}",
    "}",
    "if ($null -eq $image) {",
    "  try { $image = $item.Transfer() } catch {}",
    "}",
    "if ($null -eq $image) {",
    "  throw 'Scanner returned no image. Place the page on the flatbed or in the feeder, close the lid, and try again.'",
    "}",
    "$raw = Join-Path $env:TEMP ('bukolabs-scan-raw-' + [guid]::NewGuid().ToString())",
    "$image.SaveFile($raw)",
    "if (-not (Test-Path -LiteralPath $raw)) { throw 'Scanner did not create an image file.' }",
    "$out = Join-Path $env:TEMP ('bukolabs-scan-' + [guid]::NewGuid().ToString() + '.jpg')",
    "Add-Type -AssemblyName System.Drawing",
    "$bitmap = [System.Drawing.Image]::FromFile($raw)",
    "try {",
    "  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1",
    "  if ($encoder) {",
    "    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)",
    "    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 92)",
    "    $bitmap.Save($out, $encoder, $encParams)",
    "  } else {",
    "    $bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg)",
    "  }",
    "} finally {",
    "  $bitmap.Dispose()",
    "  Remove-Item -LiteralPath $raw -Force -ErrorAction SilentlyContinue",
    "}",
    "Write-Output $out",
  ].join("\n");

  let tempPath = "";
  try {
    tempPath = await runPowerShell(script, 180000);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Scanner returned no image")) {
      throw new Error(
        settings.source === "adf"
          ? "Scanner returned no image. Load paper in the ADF and try again."
          : "Scanner returned no image. Place the page on the flatbed, close the lid, and try again.",
      );
    }
    if (message.includes("No WIA scanner matched")) {
      throw new Error("Scanner not found. Refresh the device list and try again.");
    }
    throw new Error(
      message.replace(/^Command failed:[\s\S]*?Error:\s*/i, "").trim() ||
        "Scan failed. Check the scanner connection and try again.",
    );
  }

  if (!tempPath) {
    throw new Error("Scanner did not return an image file.");
  }

  try {
    const buffer = readFileSync(tempPath);
    if (!buffer.length) {
      throw new Error("Scanner returned an empty image.");
    }
    return buffer;
  } finally {
    try {
      unlinkSync(tempPath);
    } catch {
      // Ignore cleanup errors.
    }
  }
}

export const scannerService = {
  async listDevices() {
    const discovered = await listWindowsDevices();
    deviceRegistry.clear();
    for (const device of discovered) {
      deviceRegistry.set(device.id, device);
    }

    return { devices: discovered };
  },

  async getCapabilities(deviceId: string) {
    const device = resolveDevice(deviceId);
    if (!device) {
      throw new Error("Scanner not found. Refresh the device list and try again.");
    }

    return {
      deviceId,
      deviceName: device.name,
      dpi: [75, 150, 300, 400, 600, 1200],
      colorModes: ["Auto", "Color", "Grayscale", "Black & White"],
      pageSizes: ["A4", "A5", "Letter", "Legal", "Custom"],
      hasADF: true,
      hasDuplex: false,
    };
  },

  async startScan(deviceId: string, settings: Record<string, unknown>) {
    let device = resolveDevice(deviceId);
    if (!device) {
      await this.listDevices();
      device = resolveDevice(deviceId);
    }

    if (!device) {
      throw new Error("No scanner selected or device not found. Choose a connected scanner and try again.");
    }

    const imageBuffer = await scanWithWia(device.name, settings);
    return {
      deviceId,
      deviceName: device.name,
      settings,
      format: "jpeg",
      imageBuffer: imageBuffer.buffer.slice(
        imageBuffer.byteOffset,
        imageBuffer.byteOffset + imageBuffer.byteLength
      ),
    };
  },

  async cancelScan() {
    return { success: true };
  },
};
