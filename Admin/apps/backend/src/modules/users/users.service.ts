import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity, "online")
    private readonly users: Repository<UserEntity>
  ) {}

  async resolveRoleName(roleId?: number): Promise<string | null> {
    if (!roleId) return null;
    const rows = (await this.users.query(
      `SELECT role_name FROM roles WHERE role_id = $1`,
      [roleId]
    )) as Array<{ role_name: string }>;
    return rows[0]?.role_name ?? null;
  }

  findByUsername(username: string) {
    return this.users.findOne({
      where: { username }
    });
  }

  findById(userId: number) {
    return this.users.findOne({ where: { userId } });
  }

  findAll() {
    return this.users.find({
      where: { accountStatus: "active" },
      order: { createdAt: "DESC" }
    });
  }

  findDeleted() {
    return this.users.find({
      where: { accountStatus: "deleted" },
      order: { createdAt: "DESC" }
    });
  }

  async recordFailedLogin(userId: number) {
    const user = await this.findById(userId);
    if (!user) return;
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    const update: Partial<UserEntity> = { failedLoginAttempts: attempts };
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      update.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await this.users.update({ userId }, update);
  }

  async resetFailedLogin(userId: number) {
    await this.users.update(
      { userId },
      { failedLoginAttempts: 0, lockedUntil: null }
    );
  }

  async register(data: {
    username: string;
    password: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) {
    const roleRows = (await this.users.query(
      `SELECT role_id FROM roles WHERE role_name = 'user' LIMIT 1`
    )) as Array<{ role_id: number }>;

    const entity = this.users.create({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      roleId: roleRows[0]?.role_id,
      accountStatus: "inactive",
      passwordHash: await argon2.hash(data.password, { type: argon2.argon2id })
    });
    return this.users.save(entity);
  }

  async update(
    id: number,
    data: Partial<{
      email: string;
      accountStatus: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }>
  ) {
    await this.users.update({ userId: id }, data);
    return this.users.findOne({ where: { userId: id } });
  }

  async softDelete(id: number) {
    await this.users.update(
      { userId: id },
      { accountStatus: "deleted", deletedAt: new Date() }
    );
    return { success: true };
  }

  async remove(id: number) {
    await this.users.delete({ userId: id });
    return { success: true };
  }

  async purgeDeletedOlderThan(days: number) {
    const result = await this.users.query(
      `DELETE FROM users
       WHERE account_status = 'deleted'
         AND deleted_at IS NOT NULL
         AND deleted_at < NOW() - ($1 || ' days')::interval`,
      [days]
    );
    return { purged: result?.[1] ?? 0 };
  }
}
