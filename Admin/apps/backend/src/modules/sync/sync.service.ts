import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { DataSource } from "typeorm";
import { sha256FromBuffer } from "../../shared/utils/sha256.util";
import { NotificationsGateway } from "../notifications/notifications.gateway";

type SyncDocumentInput = {
  filename: string;
  mimeType?: string;
  fileSize?: number;
  fileHash: string;
  ocrText?: string;
  contentBase64?: string;
  deviceId?: number;
};

@Injectable()
export class SyncService {
  constructor(
    @InjectDataSource("online")
    private readonly db: DataSource,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsGateway
  ) {}

  private storageDir() {
    const dir = this.config.get<string>("STORAGE_PATH", "./uploads");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async uploadDocuments(userId: number, payload: SyncDocumentInput | SyncDocumentInput[]) {
    const items = Array.isArray(payload) ? payload : [payload];
    const results = [];

    for (const item of items) {
      const existing = (await this.db.query(
        `SELECT document_id FROM documents WHERE file_hash = $1 AND is_deleted = FALSE LIMIT 1`,
        [item.fileHash]
      )) as Array<{ document_id: number }>;

      if (existing[0]) {
        results.push({ fileHash: item.fileHash, status: "skipped_duplicate" });
        continue;
      }

      let filePath = "";
      if (item.contentBase64) {
        const buffer = Buffer.from(item.contentBase64, "base64");
        const checksum = sha256FromBuffer(buffer);
        if (checksum !== item.fileHash) {
          results.push({ fileHash: item.fileHash, status: "hash_mismatch" });
          continue;
        }
        filePath = join(this.storageDir(), `${item.fileHash}-${item.filename}`);
        writeFileSync(filePath, buffer);
      }

      const inserted = (await this.db.query(
        `INSERT INTO documents
          (filename, file_path, file_type, file_size, file_hash, ocr_text, uploaded_by, cloud_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'synced')
         RETURNING document_id`,
        [
          item.filename,
          filePath,
          item.mimeType ?? null,
          item.fileSize ?? null,
          item.fileHash,
          item.ocrText ?? null,
          userId
        ]
      )) as Array<{ document_id: number }>;

      await this.db.query(
        `INSERT INTO cloud_sync (document_id, user_id, device_id, sync_date, sync_status, retry_count)
         VALUES ($1, $2, $3, NOW(), 'completed', 0)`,
        [inserted[0].document_id, userId, item.deviceId ?? null]
      );

      results.push({
        documentId: inserted[0].document_id,
        fileHash: item.fileHash,
        status: "synced"
      });
    }

    this.notifications.emitSyncProgress({
      userId,
      synced: results.filter((r) => r.status === "synced").length,
      total: items.length
    });

    return { received: true, count: items.length, results };
  }
}
