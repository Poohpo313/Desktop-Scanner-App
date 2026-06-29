import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("documents")
export class DocumentEntity {
  @PrimaryGeneratedColumn({ name: "document_id" })
  documentId!: number;

  @Column()
  filename!: string;

  @Column({ name: "file_path" })
  filePath!: string;

  @Column({ name: "file_type", nullable: true })
  fileType?: string;

  @Column({ name: "file_size", type: "bigint", nullable: true })
  fileSize?: string;

  @Column({ name: "file_hash", nullable: true })
  fileHash?: string;

  @Column({ name: "ocr_text", type: "text", nullable: true })
  ocrText?: string;

  @Column({ name: "uploaded_by", nullable: true })
  uploadedBy?: number;

  @Column({ name: "folder_id", nullable: true })
  folderId?: number;

  @CreateDateColumn({ name: "upload_date" })
  uploadDate!: Date;

  @Column({ name: "cloud_status", default: "unsynced" })
  cloudStatus!: string;

  @Column({ name: "is_deleted", default: false })
  isDeleted!: boolean;

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deletedAt?: Date;
}
