import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("devices")
export class DeviceEntity {
  @PrimaryGeneratedColumn({ name: "device_id" })
  deviceId!: number;

  @Column({ name: "device_name", nullable: true })
  deviceName?: string;

  @Column({ name: "device_type", nullable: true })
  deviceType?: string;

  @Column({ name: "serial_number", nullable: true })
  serialNumber?: string;

  @Column({ name: "assigned_user", nullable: true })
  assignedUser?: number;

  @Column({ default: "active" })
  status!: string;

  @Column({ name: "last_seen", type: "timestamp", nullable: true })
  lastSeen?: Date;
}
