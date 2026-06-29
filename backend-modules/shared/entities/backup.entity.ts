import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'backups' })
export class BackupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'triggered_by_user_id', type: 'uuid', nullable: true })
  triggeredByUserId!: string | null;

  @Column({ name: 'file_path' })
  filePath!: string;

  @Column({ name: 'checksum_sha256', length: 64 })
  checksumSha256!: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes!: string;

  @Column({ default: 'completed', length: 20 })
  status!: 'queued' | 'completed' | 'failed' | 'deleted';

  @Column({ name: 'restored_at', type: 'timestamptz', nullable: true })
  restoredAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
