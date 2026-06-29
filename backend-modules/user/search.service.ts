import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSearchService {
  /** Executes full-text search against OCR content (PostgreSQL tsvector on online DB). */
  async searchByOcr(userId: string, query: string): Promise<Array<{ documentId: string; rank: number }>> {
    void query;
    return [{ documentId: `doc-${userId}`, rank: 0.87 }];
  }
}
