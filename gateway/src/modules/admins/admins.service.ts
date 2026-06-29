import {
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import { AdminEntity } from "./entities/admin.entity";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity, "online")
    private readonly admins: Repository<AdminEntity>
  ) {}

  async resolveRoleName(roleId?: number): Promise<string | null> {
    if (!roleId) return null;
    const rows = (await this.admins.query(
      `SELECT role_name FROM roles WHERE role_id = $1`,
      [roleId]
    )) as Array<{ role_name: string }>;
    return rows[0]?.role_name ?? null;
  }

  findByUsername(username: string) {
    return this.admins.findOne({
      where: { username, accountStatus: "active" }
    });
  }

  findById(adminId: number) {
    return this.admins.findOne({ where: { adminId } });
  }

  async findSuperAdminByPin(pin: string) {
    const rows = await this.findSuperAdminCandidates();

    for (const admin of rows) {
      if (!admin.pinHash?.startsWith("$argon2")) continue;
      try {
        const ok = await argon2.verify(admin.pinHash, pin);
        if (ok) return admin;
      } catch {
        continue;
      }
    }

    if (rows.length) {
      await this.recordFailedLogin(rows[0].adminId);
    }
    return null;
  }

  findSuperAdminCandidates() {
    return this.admins.query(`
      SELECT a.admin_id AS "adminId", a.username, a.pin_hash AS "pinHash",
             a.failed_login_attempts AS "failedLoginAttempts", a.locked_until AS "lockedUntil"
      FROM admins a
      INNER JOIN roles r ON r.role_id = a.role_id
      WHERE r.role_name = 'superadmin' AND a.account_status = 'active'
    `) as Promise<
      Array<{
        adminId: number;
        username: string;
        pinHash: string | null;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
      }>
    >;
  }

  async recordFailedLogin(adminId: number) {
    const admin = await this.findById(adminId);
    if (!admin) return;
    const attempts = (admin.failedLoginAttempts ?? 0) + 1;
    const update: Partial<AdminEntity> = { failedLoginAttempts: attempts };
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      update.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await this.admins.update({ adminId }, update);
  }

  async resetFailedLogin(adminId: number) {
    await this.admins.update(
      { adminId },
      { failedLoginAttempts: 0, lockedUntil: null }
    );
  }

  findAll() {
    return this.admins
      .createQueryBuilder("a")
      .innerJoin("roles", "r", "r.role_id = a.role_id")
      .where("a.account_status = :status", { status: "active" })
      .andWhere("r.role_name != :superadminRole", { superadminRole: "superadmin" })
      .orderBy("a.created_at", "DESC")
      .getMany();
  }

  findDeleted() {
    return this.admins
      .createQueryBuilder("a")
      .innerJoin("roles", "r", "r.role_id = a.role_id")
      .where("a.account_status = :status", { status: "deleted" })
      .andWhere("r.role_name != :superadminRole", { superadminRole: "superadmin" })
      .orderBy("a.created_at", "DESC")
      .getMany();
  }

  async create(data: {
    username: string;
    password: string;
    firstName?: string;
    middleInitial?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    department?: string;
    departments?: string[];
    company?: string;
    roleId?: number;
  }) {
    const departments =
      data.departments?.map((item) => item.trim()).filter(Boolean) ??
      (data.department?.trim() ? [data.department.trim()] : []);

    const entity = this.admins.create({
      username: data.username,
      firstName: data.firstName,
      middleInitial: data.middleInitial,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      department: departments[0] ?? data.department,
      departments,
      company: data.company,
      roleId: data.roleId ?? 2,
      accountStatus: "active",
      passwordHash: await argon2.hash(data.password, { type: argon2.argon2id })
    });
    return this.admins.save(entity);
  }

  async update(
    id: number,
    data: Partial<{
      firstName: string;
      middleInitial: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      department: string;
      departments: string[];
      company: string;
      roleId: number;
      accountStatus: string;
      password: string;
    }>
  ) {
    const { password, ...rest } = data;
    const update: Partial<AdminEntity> = { ...rest };

    if (data.departments) {
      const departments = data.departments.map((item) => item.trim()).filter(Boolean);
      update.departments = departments;
      update.department = departments[0] ?? data.department;
    }

    if (password) {
      update.passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    }
    await this.admins.update({ adminId: id }, update);
    return this.admins.findOne({ where: { adminId: id } });
  }

  async updatePassword(adminId: number, passwordHash: string) {
    await this.admins.update({ adminId }, { passwordHash });
  }

  async updatePin(adminId: number, pinHash: string) {
    await this.admins.update({ adminId }, { pinHash });
  }

  async softDelete(id: number) {
    const admin = await this.admins.findOne({ where: { adminId: id } });
    if (!admin) throw new NotFoundException("Admin not found");

    const roleName = await this.resolveRoleName(admin.roleId);
    if (roleName === "superadmin") {
      throw new NotFoundException("Admin not found");
    }

    admin.accountStatus = "deleted";
    admin.deletedAt = new Date();
    return this.admins.save(admin);
  }

  async restore(id: number) {
    const admin = await this.admins.findOne({ where: { adminId: id } });
    if (!admin) throw new NotFoundException("Admin not found");
    admin.accountStatus = "active";
    admin.deletedAt = null;
    return this.admins.save(admin);
  }

  async permanentDelete(id: number) {
    const result = await this.admins.delete({ adminId: id });
    if (!result.affected) throw new NotFoundException("Admin not found");
    return { success: true };
  }

  async purgeDeletedOlderThan(days: number) {
    const result = await this.admins.query(
      `DELETE FROM admins
       WHERE account_status = 'deleted'
         AND deleted_at IS NOT NULL
         AND deleted_at < NOW() - ($1 || ' days')::interval`,
      [days]
    );
    return { purged: result?.[1] ?? 0 };
  }
}
