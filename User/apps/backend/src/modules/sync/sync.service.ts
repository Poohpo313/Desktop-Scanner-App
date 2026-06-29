import { Injectable } from "@nestjs/common";

@Injectable()
export class SyncService {
  uploadDocuments(payload: unknown) {
    return { received: true, count: Array.isArray(payload) ? payload.length : 1 };
  }
}
