import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'serial_keys' })
export class SerialKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 24 })
  code!: string;

  @Column({ default: 'available', length: 20 })
  status!: 'available' | 'assigned' | 'used' | 'revoked' | 'deactivated';

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId!: string | null;

  @Column({ name: 'assigned_to_admin_id', type: 'uuid', nullable: true })
  assignedToAdminId!: string | null;

  @Column({ name: 'used_by_user_id', type: 'uuid', nullable: true })
  usedByUserId!: string | null;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
