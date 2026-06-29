import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { EntityManager, QueryFailedError, Repository } from "typeorm";
import { AdminsService } from "../admins/admins.service";
import {
  appendDepartmentScope,
  buildAdminScope,
  isSuperAdmin,
  resolveActorId,
  type ScopedActor,
} from "../../shared/admin-scope";
import type { PaginationInput } from "../../shared/pagination";
import { queryScopedList } from "../../shared/scoped-query";
import { AdminScopeService } from "../../shared/services/admin-scope.service";
import { UserEntity } from "./entities/user.entity";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity, "online")
    private readonly users: Repository<UserEntity>,
    private readonly admins: AdminsService,
    private readonly adminScope: AdminScopeService,
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

  async findByUsernameIgnoreCase(username: string) {
    const rows = (await this.users.query(
      `SELECT user_id AS "userId"
       FROM users
       WHERE LOWER(username) = LOWER($1)
         AND account_status <> 'deleted'
       LIMIT 1`,
      [username.trim()]
    )) as Array<{ userId: number }>;

    if (!rows[0]?.userId) return null;
    return this.findById(rows[0].userId);
  }

  findById(userId: number) {
    return this.users.findOne({ where: { userId } });
  }

  findAll() {
    return this.syncRevokedUsersToRecycleBin().then(() =>
      this.users.query(`
      SELECT
        u.user_id AS "userId",
        u.username,
        u.first_name AS "firstName",
        u.middle_initial AS "middleInitial",
        u.last_name AS "lastName",
        u.email,
        u.phone_number AS "phoneNumber",
        u.department,
        u.company,
        u.account_status AS "accountStatus",
        COALESCE(u.serial_key, sk.serial_key) AS "serialKey",
        u.created_at AS "createdAt"
      FROM users u
      LEFT JOIN serial_keys sk
        ON sk.assigned_to = u.user_id
        AND sk.status IN ('assigned', 'used')
      WHERE u.account_status <> 'deleted'
      ORDER BY u.created_at DESC
    `));
  }

  async findAllForActor(actor: ScopedActor, pagination?: PaginationInput) {
    if (isSuperAdmin(actor.role)) {
      return queryScopedList(this.users, {
        baseSql: `
      SELECT
        u.user_id AS "userId",
        u.username,
        u.first_name AS "firstName",
        u.middle_initial AS "middleInitial",
        u.last_name AS "lastName",
        u.email,
        u.phone_number AS "phoneNumber",
        u.department,
        u.company,
        u.account_status AS "accountStatus",
        COALESCE(u.serial_key, sk.serial_key) AS "serialKey",
        u.created_at AS "createdAt"
      FROM users u
      LEFT JOIN serial_keys sk
        ON sk.assigned_to = u.user_id
        AND sk.status IN ('assigned', 'used')
      WHERE u.account_status <> 'deleted'`,
        params: [],
        orderSql: "ORDER BY u.created_at DESC",
        pagination,
        beforeQuery: () => this.syncRevokedUsersToRecycleBin(),
      });
    }

    const scope = await this.adminScope.resolveScope(actor);
    if (!scope?.company || !scope.department) return [];

    const params: unknown[] = [scope.company];
    const scopedSql = appendDepartmentScope(
      `
      SELECT
        u.user_id AS "userId",
        u.username,
        u.first_name AS "firstName",
        u.middle_initial AS "middleInitial",
        u.last_name AS "lastName",
        u.email,
        u.phone_number AS "phoneNumber",
        u.department,
        u.company,
        u.account_status AS "accountStatus",
        COALESCE(u.serial_key, sk.serial_key) AS "serialKey",
        u.created_at AS "createdAt"
      FROM users u
      LEFT JOIN serial_keys sk
        ON sk.assigned_to = u.user_id
        AND sk.status IN ('assigned', 'used')
      WHERE u.account_status <> 'deleted'
        AND LOWER(TRIM(COALESCE(u.company, ''))) = LOWER(TRIM($1))`,
      scope,
      "u.department",
      params,
      { requireDepartments: true },
    );

    return queryScopedList(this.users, {
      baseSql: scopedSql,
      params,
      orderSql: "ORDER BY u.created_at DESC",
      pagination,
      beforeQuery: () => this.syncRevokedUsersToRecycleBin(),
    });
  }

  private async syncRevokedUsersToRecycleBin() {
    await this.users.query(`
      UPDATE users u
      SET account_status = 'deleted',
          deleted_at = COALESCE(u.deleted_at, NOW()),
          updated_at = NOW()
      FROM serial_keys sk
      WHERE sk.assigned_to = u.user_id
        AND sk.status IN ('revoked', 'deactivated')
        AND u.account_status <> 'deleted'
    `);

    await this.users.query(`
      UPDATE devices d
      SET status = 'inactive', last_seen = NOW()
      FROM users u
      INNER JOIN serial_keys sk ON sk.assigned_to = u.user_id
      WHERE d.assigned_user = u.user_id
        AND d.device_type = 'workstation'
        AND sk.status IN ('revoked', 'deactivated')
        AND d.status = 'active'
    `);
  }

  findDeleted() {
    return this.syncRevokedUsersToRecycleBin()
      .then(() =>
        this.users.query(`
      SELECT
        u.user_id AS "userId",
        u.username,
        u.first_name AS "firstName",
        u.middle_initial AS "middleInitial",
        u.last_name AS "lastName",
        u.email,
        u.phone_number AS "phoneNumber",
        u.department,
        u.company,
        u.account_status AS "accountStatus",
        COALESCE(u.serial_key, sk.serial_key) AS "serialKey",
        u.created_at AS "createdAt",
        u.deleted_at AS "deletedAt"
      FROM users u
      LEFT JOIN serial_keys sk ON sk.assigned_to = u.user_id
      WHERE u.account_status = 'deleted'
      ORDER BY u.deleted_at DESC NULLS LAST, u.created_at DESC
    `),
      )
      .catch(() => []);
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

  async registerForActor(
    actor: ScopedActor,
    data: {
      username: string;
      password: string;
      email?: string;
      role?: string;
      firstName?: string;
      middleInitial?: string;
      lastName?: string;
      phoneNumber?: string;
      department?: string;
      company?: string;
    },
  ) {
    if (isSuperAdmin(actor.role)) {
      return this.register(data);
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    const scope = buildAdminScope(admin);
    if (!scope?.department) {
      throw new ForbiddenException("Admin department assignment is required before registering users.");
    }

    return this.register({
      ...data,
      company: scope.company,
      department: scope.department,
    });
  }

  async register(data: {
    username: string;
    password: string;
    email?: string;
    role?: string;
    firstName?: string;
    middleInitial?: string;
    lastName?: string;
    phoneNumber?: string;
    department?: string;
    company?: string;
  }) {
    const existingUsername = await this.findByUsername(data.username.trim());
    if (existingUsername && existingUsername.accountStatus !== "deleted") {
      throw new ConflictException("Username already exists");
    }

    if (data.email?.trim()) {
      const existingEmail = await this.users.findOne({
        where: { email: data.email.trim() }
      });
      if (existingEmail && existingEmail.accountStatus !== "deleted") {
        throw new ConflictException("Email already registered to another user account");
      }
    }

    const roleRows = (await this.users.query(
      `SELECT role_id FROM roles WHERE role_name = 'user' LIMIT 1`
    )) as Array<{ role_id: number }>;

    const entity = this.users.create({
      username: data.username.trim(),
      email: data.email?.trim(),
      firstName: data.firstName?.trim(),
      middleInitial: data.middleInitial?.trim(),
      lastName: data.lastName?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      department: data.department?.trim(),
      company: data.company?.trim(),
      roleId: roleRows[0]?.role_id,
      accountStatus: "inactive",
      passwordHash: await argon2.hash(data.password, { type: argon2.argon2id })
    });
    const saved = await this.users.save(entity);

    return {
      userId: saved.userId,
      username: saved.username,
      firstName: saved.firstName,
      middleInitial: saved.middleInitial,
      lastName: saved.lastName,
      email: saved.email,
      phoneNumber: saved.phoneNumber,
      department: saved.department,
      company: saved.company,
      accountStatus: saved.accountStatus,
      serialKey: saved.serialKey ?? null,
      createdAt: saved.createdAt
    };
  }

  async updateForActor(
    actor: ScopedActor,
    id: number,
    data: Partial<{
      email: string;
      accountStatus: string;
      firstName: string;
      middleInitial: string;
      lastName: string;
      phoneNumber: string;
      department: string;
      company: string;
      password: string;
    }>,
  ) {
    if (!isSuperAdmin(actor.role)) {
      const existing = await this.findById(id);
      await this.adminScope.assertRecordInScope(
        actor,
        existing ?? {},
        "You can only update users in your assigned department.",
      );
      const { company: _company, department: _department, ...scopedData } = data;
      return this.update(id, scopedData);
    }

    return this.update(id, data);
  }

  async update(
    id: number,
    data: Partial<{
      email: string;
      accountStatus: string;
      firstName: string;
      middleInitial: string;
      lastName: string;
      phoneNumber: string;
      department: string;
      company: string;
      password: string;
    }>
  ) {
    const existing = await this.findById(id);
    if (!existing || existing.accountStatus === "deleted") {
      throw new NotFoundException("User not found");
    }

    if (data.email?.trim()) {
      const emailOwner = await this.users.findOne({
        where: { email: data.email.trim() }
      });
      if (
        emailOwner &&
        emailOwner.userId !== id &&
        emailOwner.accountStatus !== "deleted"
      ) {
        throw new ConflictException("Email already registered to another user account");
      }
    }

    const { password, ...rest } = data;
    const update = {
      ...rest,
      email: rest.email !== undefined ? rest.email.trim() || null : undefined,
      firstName: rest.firstName?.trim(),
      middleInitial: rest.middleInitial?.trim(),
      lastName: rest.lastName?.trim(),
      phoneNumber: rest.phoneNumber !== undefined ? rest.phoneNumber.trim() || null : undefined,
      department: rest.department?.trim(),
      company: rest.company?.trim(),
    } as Partial<UserEntity>;
    if (password) {
      update.passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    }
    await this.users.update({ userId: id }, update);
    const saved = await this.findById(id);
    if (!saved) throw new NotFoundException("User not found");

    return {
      userId: saved.userId,
      username: saved.username,
      firstName: saved.firstName,
      middleInitial: saved.middleInitial,
      lastName: saved.lastName,
      email: saved.email,
      phoneNumber: saved.phoneNumber,
      department: saved.department,
      company: saved.company,
      accountStatus: saved.accountStatus,
      serialKey: saved.serialKey ?? null,
      createdAt: saved.createdAt,
    };
  }

  async getDepartmentsForActor(actor: ScopedActor): Promise<string[]> {
    if (isSuperAdmin(actor.role)) {
      return this.getDepartments();
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    const scope = buildAdminScope(admin);
    return scope?.department ? [scope.department] : [];
  }

  async getCompaniesForActor(actor: ScopedActor): Promise<string[]> {
    if (isSuperAdmin(actor.role)) {
      return this.getCompanies();
    }

    const admin = await this.admins.findById(resolveActorId(actor));
    const scope = buildAdminScope(admin);
    return scope?.company ? [scope.company] : [];
  }

  async getDepartments(): Promise<string[]> {
    const rows = (await this.users.query(`
      SELECT DISTINCT department FROM (
        SELECT TRIM(department) AS department FROM users
          WHERE department IS NOT NULL AND TRIM(department) <> ''
        UNION
        SELECT TRIM(department) AS department FROM admins
          WHERE department IS NOT NULL AND TRIM(department) <> ''
        UNION
        SELECT TRIM(department) AS department FROM serial_keys
          WHERE department IS NOT NULL AND TRIM(department) <> ''
      ) d
      ORDER BY department
    `)) as Array<{ department: string }>;
    return rows.map((row) => row.department);
  }

  async getCompanies(): Promise<string[]> {
    const rows = (await this.users.query(`
      SELECT DISTINCT company FROM (
        SELECT TRIM(company) AS company FROM users
          WHERE company IS NOT NULL AND TRIM(company) <> ''
        UNION
        SELECT TRIM(company) AS company FROM admins
          WHERE company IS NOT NULL AND TRIM(company) <> ''
        UNION
        SELECT TRIM(company) AS company FROM serial_keys
          WHERE company IS NOT NULL AND TRIM(company) <> ''
      ) c
      ORDER BY company
    `)) as Array<{ company: string }>;
    return rows.map((row) => row.company);
  }

  async restoreFromRecycle(id: number) {
    const existing = await this.findById(id);
    if (!existing || existing.accountStatus !== "deleted") {
      throw new NotFoundException("Deleted user not found");
    }

    await this.users.update(
      { userId: id },
      { accountStatus: "active", deletedAt: null }
    );

    await this.users.query(
      `UPDATE serial_keys
       SET status = 'used'
       WHERE assigned_to = $1
         AND status IN ('revoked', 'deactivated')`,
      [id]
    );

    return { success: true };
  }

  async softDeleteForActor(actor: ScopedActor, id: number) {
    if (!isSuperAdmin(actor.role)) {
      const existing = await this.findById(id);
      await this.adminScope.assertRecordInScope(
        actor,
        existing ?? {},
        "You can only remove users in your assigned department.",
      );
    }

    return this.softDelete(id);
  }

  async softDelete(id: number) {
    await this.users.update(
      { userId: id },
      { accountStatus: "deleted", deletedAt: new Date() }
    );
    return { success: true };
  }

  async remove(id: number) {
    await this.users.manager.transaction(async (manager) => {
      const userFolderIds = (await manager.query(
        `SELECT folder_id FROM folders WHERE created_by = $1`,
        [id],
      )) as Array<{ folder_id: number }>;
      const folderIds = userFolderIds.map((row) => row.folder_id);

      const userDocumentIds =
        folderIds.length > 0
          ? ((await manager.query(
              `SELECT document_id FROM documents
               WHERE uploaded_by = $1 OR folder_id = ANY($2::int[])`,
              [id, folderIds],
            )) as Array<{ document_id: number }>)
          : ((await manager.query(
              `SELECT document_id FROM documents WHERE uploaded_by = $1`,
              [id],
            )) as Array<{ document_id: number }>);
      const documentIds = userDocumentIds.map((row) => row.document_id);

      if (documentIds.length > 0) {
        await manager.query(`DELETE FROM scan_history WHERE document_id = ANY($1::int[])`, [
          documentIds,
        ]);
        await manager.query(`DELETE FROM cloud_sync WHERE document_id = ANY($1::int[])`, [
          documentIds,
        ]);
      }

      await manager.query(`DELETE FROM scan_history WHERE scanned_by = $1`, [id]);
      await manager.query(`DELETE FROM cloud_sync WHERE user_id = $1`, [id]);
      await this.deleteFromOptionalTable(
        manager,
        `DELETE FROM extension_requests WHERE user_id = $1`,
        [id],
      );
      await this.deleteFromOptionalTable(
        manager,
        `DELETE FROM stored_notifications WHERE user_id = $1`,
        [id],
      );
      await manager.query(`DELETE FROM refresh_tokens WHERE account_type = 'user' AND account_id = $1`, [
        id,
      ]);
      await manager.query(`UPDATE user_concerns SET user_id = NULL WHERE user_id = $1`, [id]);
      await manager.query(
        `UPDATE serial_keys
         SET assigned_to = NULL,
             status = 'unused',
             used_at = NULL,
             expires_at = NULL
         WHERE assigned_to = $1
           AND status NOT IN ('revoked', 'deactivated')`,
        [id],
      );
      await manager.query(`UPDATE devices SET assigned_user = NULL WHERE assigned_user = $1`, [id]);
      await manager.query(`DELETE FROM activity_logs WHERE user_id = $1`, [id]);

      if (folderIds.length > 0) {
        await manager.query(`DELETE FROM documents WHERE folder_id = ANY($1::int[])`, [folderIds]);
      }
      await manager.query(`DELETE FROM documents WHERE uploaded_by = $1`, [id]);
      await manager.query(`UPDATE folders SET parent_folder_id = NULL WHERE created_by = $1`, [id]);
      await manager.query(`DELETE FROM folders WHERE created_by = $1`, [id]);
      await manager.query(`DELETE FROM users WHERE user_id = $1`, [id]);
    });
    return { success: true };
  }

  private async deleteFromOptionalTable(
    manager: EntityManager,
    sql: string,
    params: unknown[],
  ) {
    try {
      await manager.query(sql, params);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string } | undefined)?.code === "42P01"
      ) {
        return;
      }
      throw error;
    }
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
