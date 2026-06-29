import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn({ name: "user_id" })
  userId!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ name: "first_name", nullable: true })
  firstName?: string;

  @Column({ name: "last_name", nullable: true })
  lastName?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ name: "phone_number", nullable: true })
  phoneNumber?: string;

  @Column({ name: "role_id", nullable: true })
  roleId?: number;

  @Column({ name: "account_status", default: "inactive" })
  accountStatus!: string;

  @Column({ name: "serial_key", nullable: true })
  serialKey?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
