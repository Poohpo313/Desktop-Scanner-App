"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = void 0;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const pdf_lib_1 = require("pdf-lib");
const electron_1 = require("electron");
const db_service_1 = require("./db.service");
const hash_service_1 = require("./hash.service");
const ocr_service_1 = require("./ocr.service");
const fs_service_1 = require("./fs.service");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
function storageRoot() {
    return path_1.default.join(electron_1.app.getPath("userData"), "documents");
}
function isPngBuffer(buffer) {
    return buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50;
}
function isJpegBuffer(buffer) {
    return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
}
function isBmpBuffer(buffer) {
    return buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d;
}
function stripToJpegStart(buffer) {
    if (isJpegBuffer(buffer))
        return buffer;
    for (let index = 0; index < buffer.length - 1; index += 1) {
        if (buffer[index] === 0xff && buffer[index + 1] === 0xd8) {
            return buffer.subarray(index);
        }
    }
    return buffer;
}
async function convertImageWithWindowsDrawing(buffer) {
    if (process.platform !== "win32" || !buffer.length) {
        return null;
    }
    const tempDir = os_1.default.tmpdir();
    const inputPath = path_1.default.join(tempDir, `bukolabs-save-in-${Date.now()}.bmp`);
    const outputPath = path_1.default.join(tempDir, `bukolabs-save-out-${Date.now()}.jpg`);
    try {
        fs_1.default.writeFileSync(inputPath, buffer);
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
        await execFileAsync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
        if (!fs_1.default.existsSync(outputPath)) {
            return null;
        }
        const converted = fs_1.default.readFileSync(outputPath);
        return converted.length ? converted : null;
    }
    catch {
        return null;
    }
    finally {
        for (const filePath of [inputPath, outputPath]) {
            try {
                fs_1.default.unlinkSync(filePath);
            }
            catch {
                // Ignore cleanup errors.
            }
        }
    }
}
async function normalizeScanImage(imageBuffer) {
    if (!imageBuffer?.length) {
        throw new Error("Scan image data is empty. Scan again before saving.");
    }
    const attempts = [imageBuffer, stripToJpegStart(imageBuffer)];
    for (const attempt of attempts) {
        if (!attempt.length)
            continue;
        const image = electron_1.nativeImage.createFromBuffer(attempt);
        if (!image.isEmpty()) {
            const png = Buffer.from(image.toPNG());
            const jpeg = Buffer.from(image.toJPEG(92));
            if (png.length && jpeg.length) {
                return { png, jpeg };
            }
        }
    }
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `bukolabs-save-${Date.now()}.jpg`);
    try {
        fs_1.default.writeFileSync(tempPath, imageBuffer);
        const fromPath = electron_1.nativeImage.createFromPath(tempPath);
        if (!fromPath.isEmpty()) {
            const png = Buffer.from(fromPath.toPNG());
            const jpeg = Buffer.from(fromPath.toJPEG(92));
            if (png.length && jpeg.length) {
                return { png, jpeg };
            }
        }
    }
    catch {
        // Fall through to Windows conversion.
    }
    finally {
        try {
            fs_1.default.unlinkSync(tempPath);
        }
        catch {
            // Ignore cleanup errors.
        }
    }
    const converted = await convertImageWithWindowsDrawing(imageBuffer);
    if (converted?.length) {
        const image = electron_1.nativeImage.createFromBuffer(converted);
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
async function embedImageInPdf(pdfDoc, imageBuffer) {
    const jpegCandidate = stripToJpegStart(imageBuffer);
    if (isPngBuffer(imageBuffer)) {
        return pdfDoc.embedPng(imageBuffer);
    }
    if (isJpegBuffer(jpegCandidate)) {
        try {
            return await pdfDoc.embedJpg(jpegCandidate);
        }
        catch {
            return await pdfDoc.embedPng((await normalizeScanImage(imageBuffer)).png);
        }
    }
    return await pdfDoc.embedPng((await normalizeScanImage(imageBuffer)).png);
}
async function imageBufferToPdf(imageBuffer) {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const embedded = await embedImageInPdf(pdfDoc, imageBuffer);
    const page = pdfDoc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    return Buffer.from(await pdfDoc.save());
}
async function imageBuffersToPdf(imageBuffers) {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    for (const imageBuffer of imageBuffers) {
        const embedded = await embedImageInPdf(pdfDoc, imageBuffer);
        const page = pdfDoc.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    }
    return Buffer.from(await pdfDoc.save());
}
async function prepareSavedFile(imageBuffers, fileType, skipOcr, existingOcr) {
    const buffers = imageBuffers.filter((buffer) => buffer?.length);
    if (!buffers.length) {
        throw new Error("Scan image data is empty. Scan again before saving.");
    }
    const imageBuffer = buffers[0];
    const ext = fileType === "jpeg" ? "jpeg" : fileType === "png" ? "png" : "pdf";
    let ocrText = existingOcr?.trim() ?? "";
    if (!skipOcr && !ocrText) {
        const ocrParts = [];
        for (const buffer of buffers) {
            const jpegCandidate = stripToJpegStart(buffer);
            const ocrSource = isJpegBuffer(jpegCandidate)
                ? jpegCandidate
                : isPngBuffer(buffer)
                    ? buffer
                    : (await normalizeScanImage(buffer)).png;
            try {
                const text = await ocr_service_1.ocrService.extractText(ocrSource);
                if (text.trim())
                    ocrParts.push(text.trim());
            }
            catch {
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
    const hasKnownFormat = isPngBuffer(imageBuffer) || isJpegBuffer(jpegCandidate) || isBmpBuffer(imageBuffer);
    let normalized = null;
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
exports.fileService = {
    async save(payload) {
        const imageBuffers = (payload.imageBuffers?.length
            ? payload.imageBuffers
            : payload.imageBuffer
                ? [payload.imageBuffer]
                : []).map((buffer) => Buffer.from(buffer));
        const exportFolder = payload.exportFolder?.trim();
        const skipOcr = Boolean(payload.skipOcr);
        const prepared = await prepareSavedFile(imageBuffers, payload.fileType ?? "pdf", skipOcr, payload.ocrText);
        const hash = hash_service_1.hashService.sha256(prepared.buffer);
        let finalPath;
        let finalName = payload.filename;
        if (exportFolder) {
            const unique = await fs_service_1.fsService.resolveUniqueFilePath(exportFolder, `${payload.filename}.${prepared.ext}`);
            finalPath = unique.path;
            finalName = unique.fileName.replace(/\.[^.\\]+$/, "") || payload.filename;
            fs_1.default.writeFileSync(finalPath, prepared.buffer);
        }
        else {
            const dir = storageRoot();
            fs_1.default.mkdirSync(dir, { recursive: true });
            finalPath = path_1.default.join(dir, `${Date.now()}-${payload.filename}.${prepared.ext}`);
            fs_1.default.writeFileSync(finalPath, prepared.buffer);
        }
        const rows = await (0, db_service_1.query)(`INSERT INTO documents (filename, file_path, file_type, file_size, file_hash, ocr_text, uploaded_by, cloud_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'unsynced') RETURNING document_id`, [
            finalName,
            finalPath,
            prepared.ext,
            prepared.buffer.length,
            hash,
            prepared.ocrText,
            payload.userId,
        ]).catch(() => []);
        const documentId = rows[0]?.document_id;
        if (documentId) {
            await (0, db_service_1.query)(`INSERT INTO cloud_sync (document_id, sync_status, retry_count) VALUES ($1, 'pending', 0)`, [documentId]).catch(() => undefined);
        }
        return {
            documentId,
            hash,
            filePath: finalPath,
            ocrText: prepared.ocrText,
            fileName: path_1.default.basename(finalPath),
        };
    },
    async extractOcrFromPath(filePath) {
        const buffer = fs_1.default.readFileSync(filePath);
        const ocrText = await ocr_service_1.ocrService.extractText(buffer);
        return { ocrText };
    },
    async list(payload) {
        const files = await (0, db_service_1.query)(`SELECT document_id, filename, file_type, file_size, upload_date, cloud_status
       FROM documents WHERE uploaded_by = $1 AND is_deleted = FALSE
       ORDER BY upload_date DESC`, [payload.userId]);
        const folders = await (0, db_service_1.query)(`SELECT folder_id, folder_name, parent_folder_id FROM folders WHERE created_by = $1`, [payload.userId]);
        return { files, folders, folderId: payload.folderId ?? null };
    },
    async delete(documentId) {
        await (0, db_service_1.query)(`UPDATE documents SET is_deleted = TRUE, deleted_at = NOW() WHERE document_id = $1`, [documentId]);
        return { success: true };
    },
    async restore(documentId) {
        await (0, db_service_1.query)(`UPDATE documents SET is_deleted = FALSE, deleted_at = NULL WHERE document_id = $1`, [documentId]);
        return { success: true };
    },
    async search(payload) {
        const q = payload.query.trim();
        if (!q)
            return { results: [] };
        const results = await (0, db_service_1.query)(`SELECT document_id, filename, file_type, upload_date,
              ts_rank(to_tsvector('english', coalesce(ocr_text, '')), plainto_tsquery('english', $1)) AS rank
       FROM documents
       WHERE is_deleted = FALSE
         AND to_tsvector('english', coalesce(ocr_text, '')) @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC LIMIT 50`, [q]);
        return { results };
    },
    async getOcrStatus(documentId) {
        const row = await (0, db_service_1.query)("SELECT ocr_text FROM documents WHERE document_id = $1", [documentId]);
        const text = row[0]?.ocr_text;
        return { ready: Boolean(text), ocrText: text ?? "" };
    },
};
