import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("roles")
export class RoleEntity {
  @PrimaryGeneratedColumn({ name: "role_id" })
  roleId!: number;

  @Column({ name: "role_name", unique: true })
  roleName!: string;
}
