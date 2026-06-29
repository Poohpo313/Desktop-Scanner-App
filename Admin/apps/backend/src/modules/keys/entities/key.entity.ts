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
}
