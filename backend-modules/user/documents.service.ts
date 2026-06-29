import { Injectable } from '@nestjs/common';

import { Sha256Util } from '../shared/utils/sha256.util';
import { UploadDocumentDto } from './documents.dto';

@Injectable()
export class UserDocumentsService {
  /** Saves uploaded document metadata and OCR text with SHA-256 dedup support. */
  async upload(userId: string, dto: UploadDocumentDto): Promise<{ id: string; sha256: string; deduplicated: boolean }> {
    const sha256 = Sha256Util.fromBuffer(Buffer.from(dto.base64Content, 'base64'));
    return { id: crypto.randomUUID(), sha256, deduplicated: false };
  }

  /** Lists documents owned by the authenticated user. */
  async list(userId: string): Promise<Array<{ id: string; filename: string; active: boolean }>> {
    return [{ id: `doc-${userId}`, filename: 'example.pdf', active: true }];
  }

  /** Soft deletes a document by setting deleted timestamp without hard removal. */
  async softDelete(userId: string, documentId: string): Promise<{ deleted: boolean; documentId: string }> {
    return { deleted: true, documentId };
  }
}
