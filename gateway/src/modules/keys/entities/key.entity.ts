import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("serial_keys")
export class SerialKeyEntity {
  @PrimaryGeneratedColumn({ name: "serial_id" })
  serialId!: number;

  @Column({ name: "serial_key", unique: true })
  serialKey!: string;

  @Column({ name: "assigned_to", nullable: true })
  assignedTo?: number;

  @Column({ name: "assigned_admin", nullable: true })
  assignedAdmin?: number;

  @Column({ default: "unused" })
  status!: string;

  @CreateDateColumn({ name: "generated_at" })
  generatedAt!: Date;

  @Column({ name: "used_at", nullable: true, type: "timestamp" })
  usedAt?: Date;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ name: "expires_at", nullable: true, type: "timestamp" })
  expiresAt?: Date | null;

  @Column({ name: "duration_days", nullable: true, type: "int" })
  durationDays?: number | null;

  @Column({ name: "extended_at", nullable: true, type: "timestamp" })
  extendedAt?: Date | null;

  @Column({ name: "extension_count", type: "int", default: 0 })
  extensionCount!: number;

  @Column({ name: "extension_status", type: "varchar", length: 20, nullable: true })
  extensionStatus?: string | null;

  @Column({ name: "renewal_status", type: "varchar", length: 20, nullable: true })
  renewalStatus?: string | null;

  @Column({ type: "boolean", default: false })
  trial!: boolean;
}
