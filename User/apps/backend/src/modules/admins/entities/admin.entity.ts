import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("admins")
export class AdminEntity {
  @PrimaryGeneratedColumn({ name: "admin_id" })
  adminId!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ name: "pin_hash", nullable: true })
  pinHash?: string;

  @Column({ name: "first_name", nullable: true })
  firstName?: string;

  @Column({ name: "last_name", nullable: true })
  lastName?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ name: "role_id", nullable: true })
  roleId?: number;

  @Column({ name: "account_status", default: "active" })
  accountStatus!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
