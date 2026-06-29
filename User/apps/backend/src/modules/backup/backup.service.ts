import { Injectable } from "@nestjs/common";

type BackupRecord = {
  id: number;
  version: string;
  sizeMb: number;
  encrypted: boolean;
  createdAt: string;
};

@Injectable()
export class BackupService {
  private records: BackupRecord[] = [];

  getHistory() {
    return this.records;
  }

  manual() {
    const record: BackupRecord = {
      id: Date.now(),
      version: `v${this.records.length + 1}`,
      sizeMb: Math.round(Math.random() * 500 + 100),
      encrypted: true,
      createdAt: new Date().toISOString()
    };
    this.records.unshift(record);
    return { ...record, status: "started" };
  }

  restore(id: string) {
    const found = this.records.find((h) => h.id === Number(id));
    if (!found) return { id, status: "failed" };
    return { id, status: "restored" };
  }

  delete(id: string) {
    this.records = this.records.filter((h) => h.id !== Number(id));
    return { id, deleted: true };
  }
}
