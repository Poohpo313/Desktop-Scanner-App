import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { PDFDocument } from "pdf-lib";
import { app, nativeImage } from "electron";
import { query } from "./db.service";
import { hashService } from "./hash.service";
import { ocrService } from "./ocr.service";
import { fsService } from "./fs.service";

const execFileAsync = promisify(execFile);

function storageRoot() {
  return path.join(app.getPath("userData"), "documents");
}

function isPngBuffer(buffer: Buffer): boolean {
  return buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50;
}

function isJpegBuffer(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
}

function isBmpBuffer(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d;
}

function stripToJpegStart(buffer: Buffer): Buffer {
  if (isJpegBuffer(buffer)) return buffer;
  for (let index = 0; index < buffer.length - 1; index += 1) {
    if (buffer[index] === 0xff && buffer[index + 1] === 0xd8) {
      return buffer.subarray(index);
    }
  }
  return buffer;
}

async function convertImageWithWindowsDrawing(buffer: Buffer): Promise<Buffer | null> {
  if (process.platform !== "win32" || !buffer.length) {
    return null;
  }

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `bukolabs-save-in-${Date.now()}.bmp`);
  const outputPath = path.join(tempDir, `bukolabs-save-out-${Date.now()}.jpg`);

  try {
    fs.writeFileSync(inputPath, buffer);
    const script = [
      "$ErrorActionPreference = 'Stop'",
      `Add-Type -AssemblyName System.Drawing`,
      `$bytes = [System.IO.File]::ReadAllBytes('${inputPath.replace(/'/g, "''")}')`,
      `$stream = New-Object System.IO.MemoryStream(,$bytes)`,
      `$bitmap = [System.Drawing.Image]::FromStream($stream)`,
      `try {`,
      `  $out = '${outputPath.replace(/'/g, "''")}'`,
      `  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1`,
      `  if ($encoder) {`,
      `    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)`,
      `    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 92)`,
      `    $bitmap.Save($out, $encoder, $encParams)`,
      `  } else {`,
      `    $bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg)`,
      `  }`,
      `} finally {`,
      `  $bitmap.Dispose()`,
      `  $stream.Dispose()`,
      `}`,
    ].join("\n");

    await execFileAsync(
      "powershell",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      { timeout: 60000, maxBuffer: 4 * 1024 * 1024 },
    );

    if (!fs.existsSync(outputPath)) {
      return null;
    }

    const converted = fs.readFileSync(outputPath);
    return converted.length ? converted : null;
  } catch {
    return null;
  } finally {
    for (const filePath of [inputPath, outputPath]) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
}

async function normalizeScanImage(imageBuffer: Buffer): Promise<{ png: Buffer; jpeg: Buffer }> {
  if (!imageBuffer?.length) {
    throw new Error("Scan image data is empty. Scan again before saving.");
  }

  const attempts: Buffer[] = [imageBuffer, stripToJpegStart(imageBuffer)];

  for (const attempt of attempts) {
    if (!attempt.length) continue;

    const image = nativeImage.createFromBuffer(attempt);
    if (!image.isEmpty()) {
      const png = Buffer.from(image.toPNG());
      const jpeg = Buffer.from(image.toJPEG(92));
      if (png.length && jpeg.length) {
        return { png, jpeg };
      }
    }
  }

  const tempPath = path.join(os.tmpdir(), `bukolabs-save-${Date.now()}.jpg`);
  try {
    fs.writeFileSync(tempPath, imageBuffer);
    const fromPath = nativeImage.createFromPath(tempPath);
    if (!fromPath.isEmpty()) {
      const png = Buffer.from(fromPath.toPNG());
      const jpeg = Buffer.from(fromPath.toJPEG(92));
      if (png.length && jpeg.length) {
        return { png, jpeg };
      }
    }
  } catch {
    // Fall through to Windows conversion.
  } finally {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // Ignore cleanup errors.
    }
  }

  const converted = await convertImageWithWindowsDrawing(imageBuffer);
  if (converted?.length) {
    const image = nativeImage.createFromBuffer(converted);
    if (!image.isEmpty()) {
      const png = Buffer.from(image.toPNG());
      const jpeg = Buffer.from(image.toJPEG(92));
      if (png.length && jpeg.length) {
        return { png, jpeg };
      }
    }
    if (isJpegBuffer(converted)) {
      return { png: converted, jpeg: converted };
    }
  }

  throw new Error("Could not read the scanned image. Scan again before saving.");
}

async function embedImageInPdf(pdfDoc: PDFDocument, imageBuffer: Buffer) {
  const jpegCandidate = stripToJpegStart(imageBuffer);

  if (isPngBuffer(imageBuffer)) {
    return pdfDoc.embedPng(imageBuffer);
  }

  if (isJpegBuffer(jpegCandidate)) {
    try {
      return await pdfDoc.embedJpg(jpegCandidate);
    } catch {
      return await pdfDoc.embedPng((await normalizeScanImage(imageBuffer)).png);
    }
  }

  return await pdfDoc.embedPng((await normalizeScanImage(imageBuffer)).png);
}

async function imageBufferToPdf(imageBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const embedded = await embedImageInPdf(pdfDoc, imageBuffer);
  const page = pdfDoc.addPage([embedded.width, embedded.height]);
  page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  return Buffer.from(await pdfDoc.save());
}

async function imageBuffersToPdf(imageBuffers: Buffer[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  for (const imageBuffer of imageBuffers) {
    const embedded = await embedImageInPdf(pdfDoc, imageBuffer);
    const page = pdfDoc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  }

  return Buffer.from(await pdfDoc.save());
}

async function prepareSavedFile(
  imageBuffers: Buffer[],
  fileType: string,
  skipOcr: boolean,
  existingOcr?: string,
): Promise<{ buffer: Buffer; ocrText: string; ext: string }> {
  const buffers = imageBuffers.filter((buffer) => buffer?.length);
  if (!buffers.length) {
    throw new Error("Scan image data is empty. Scan again before saving.");
  }

  const imageBuffer = buffers[0];
  const ext = fileType === "jpeg" ? "jpeg" : fileType === "png" ? "png" : "pdf";
  let ocrText = existingOcr?.trim() ?? "";

  if (!skipOcr && !ocrText) {
    const ocrParts: string[] = [];
    for (const buffer of buffers) {
      const jpegCandidate = stripToJpegStart(buffer);
      const ocrSource = isJpegBuffer(jpegCandidate)
        ? jpegCandidate
        : isPngBuffer(buffer)
          ? buffer
          : (await normalizeScanImage(buffer)).png;
      try {
        const text = await ocrService.extractText(ocrSource);
        if (text.trim()) ocrParts.push(text.trim());
      } catch {
        // Continue OCR on remaining pages.
      }
    }
    ocrText = ocrParts.join("\n\n");
  }

  if (buffers.length > 1 || ext === "pdf") {
    return {
      buffer: await imageBuffersToPdf(buffers),
      ocrText,
      ext: "pdf",
    };
  }

  const jpegCandidate = stripToJpegStart(imageBuffer);
  const hasKnownFormat =
    isPngBuffer(imageBuffer) || isJpegBuffer(jpegCandidate) || isBmpBuffer(imageBuffer);

  let normalized: { png: Buffer; jpeg: Buffer } | null = null;
  const ensureNormalized = async () => {
    if (!normalized) {
      normalized = await normalizeScanImage(imageBuffer);
    }
    return normalized;
  };

  if (ext === "jpeg") {
    if (isJpegBuffer(jpegCandidate)) {
      return { buffer: jpegCandidate, ocrText, ext: "jpeg" };
    }
    return { buffer: (await ensureNormalized()).jpeg, ocrText, ext: "jpeg" };
  }

  if (isPngBuffer(imageBuffer)) {
    return { buffer: imageBuffer, ocrText, ext: "png" };
  }

  if (!hasKnownFormat) {
    return { buffer: (await ensureNormalized()).png, ocrText, ext: "png" };
  }

  return { buffer: (await ensureNormalized()).png, ocrText, ext: "png" };
}

export const fileService = {
  async save(payload: {
    imageBuffer?: ArrayBuffer;
    imageBuffers?: ArrayBuffer[];
    filename: string;
    folderId?: number;
    userId: number;
    fileType?: string;
    exportFolder?: string;
    ocrText?: string;
    skipOcr?: boolean;
  }) {
    const imageBuffers = (payload.imageBuffers?.length
      ? payload.imageBuffers
      : payload.imageBuffer
        ? [payload.imageBuffer]
        : []
    ).map((buffer) => Buffer.from(buffer));
    const exportFolder = payload.exportFolder?.trim();
    const skipOcr = Boolean(payload.skipOcr);
    const prepared = await prepareSavedFile(
      imageBuffers,
      payload.fileType ?? "pdf",
      skipOcr,
      payload.ocrText,
    );
    const hash = hashService.sha256(prepared.buffer);

    let finalPath: string;
    let finalName = payload.filename;

    if (exportFolder) {
      const unique = await fsService.resolveUniqueFilePath(
        exportFolder,
        `${payload.filename}.${prepared.ext}`,
      );
      finalPath = unique.path;
      finalName = unique.fileName.replace(/\.[^.\\]+$/, "") || payload.filename;
      fs.writeFileSync(finalPath, prepared.buffer);
    } else {
      const dir = storageRoot();
      fs.mkdirSync(dir, { recursive: true });
      finalPath = path.join(dir, `${Date.now()}-${payload.filename}.${prepared.ext}`);
      fs.writeFileSync(finalPath, prepared.buffer);
    }

    const rows = await query<{ document_id: number }>(
      `INSERT INTO documents (filename, file_path, file_type, file_size, file_hash, ocr_text, uploaded_by, cloud_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'unsynced') RETURNING document_id`,
      [
        finalName,
        finalPath,
        prepared.ext,
        prepared.buffer.length,
        hash,
        prepared.ocrText,
        payload.userId,
      ],
    ).catch(() => [] as { document_id: number }[]);

    const documentId = rows[0]?.document_id;
    if (documentId) {
      await query(
        `INSERT INTO cloud_sync (document_id, sync_status, retry_count) VALUES ($1, 'pending', 0)`,
        [documentId],
      ).catch(() => undefined);
    }

    return {
      documentId,
      hash,
      filePath: finalPath,
      ocrText: prepared.ocrText,
      fileName: path.basename(finalPath),
    };
  },

  async extractOcrFromPath(filePath: string) {
    const buffer = fs.readFileSync(filePath);
    const ocrText = await ocrService.extractText(buffer);
    return { ocrText };
  },

  async list(payload: { folderId?: number; userId: number }) {
    const files = await query(
      `SELECT document_id, filename, file_type, file_size, upload_date, cloud_status
       FROM documents WHERE uploaded_by = $1 AND is_deleted = FALSE
       ORDER BY upload_date DESC`,
      [payload.userId],
    );
    const folders = await query(
      `SELECT folder_id, folder_name, parent_folder_id FROM folders WHERE created_by = $1`,
      [payload.userId],
    );
    return { files, folders, folderId: payload.folderId ?? null };
  },

  async delete(documentId: number) {
    await query(
      `UPDATE documents SET is_deleted = TRUE, deleted_at = NOW() WHERE document_id = $1`,
      [documentId],
    );
    return { success: true };
  },

  async restore(documentId: number) {
    await query(
      `UPDATE documents SET is_deleted = FALSE, deleted_at = NULL WHERE document_id = $1`,
      [documentId],
    );
    return { success: true };
  },

  async search(payload: { query: string; filters?: Record<string, unknown> }) {
    const q = payload.query.trim();
    if (!q) return { results: [] };
    const results = await query(
      `SELECT document_id, filename, file_type, upload_date,
              ts_rank(to_tsvector('english', coalesce(ocr_text, '')), plainto_tsquery('english', $1)) AS rank
       FROM documents
       WHERE is_deleted = FALSE
         AND to_tsvector('english', coalesce(ocr_text, '')) @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC LIMIT 50`,
      [q],
    );
    return { results };
  },

  async getOcrStatus(documentId: number) {
    const row = await query<{ ocr_text: string }>(
      "SELECT ocr_text FROM documents WHERE document_id = $1",
      [documentId],
    );
    const text = row[0]?.ocr_text;
    return { ready: Boolean(text), ocrText: text ?? "" };
  },
};
