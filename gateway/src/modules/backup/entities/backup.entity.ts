import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("backups")
export class BackupEntity {
  @PrimaryGeneratedColumn({ name: "backup_id" })
  backupId!: number;

  @Column()
  version!: string;

  @Column({ name: "file_path" })
  filePath!: string;

  @Column({ name: "checksum_sha256", length: 64 })
  checksumSha256!: string;

  @Column({ name: "size_bytes", type: "bigint" })
  sizeBytes!: string;

  @Column({ default: true })
  encrypted!: boolean;

  @Column({ default: "completed" })
  status!: string;

  @Column({ name: "triggered_by", nullable: true })
  triggeredBy?: number;

  @Column({ name: "restored_at", type: "timestamp", nullable: true })
  restoredAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
