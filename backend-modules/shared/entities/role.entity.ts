import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50 })
  name!: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  permissions!: Record<string, unknown>;

  @OneToMany(() => UserEntity, (user) => user.role)
  users!: UserEntity[];
}
