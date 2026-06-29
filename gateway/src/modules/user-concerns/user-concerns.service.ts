import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  appendAdminRecordScope,
  buildAdminScope,
  isSuperAdmin,
  type ScopedActor,
} from "../../shared/admin-scope";
import type { PaginationInput } from "../../shared/pagination";
import { queryScopedList } from "../../shared/scoped-query";
import { AdminScopeService } from "../../shared/services/admin-scope.service";
import { AdminsService } from "../admins/admins.service";
import { UserEntity } from "../users/entities/user.entity";

type ConcernRow = {
  id: number;
  userId: number | null;
  username: string;
  concernType: string;
  category: string;
  subject: string;
  message: string;
  email: string | null;
  rating: number | null;
  company: string | null;
  department: string | null;
  status: string;
  timestamp: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  replyRead?: boolean;
};

@Injectable()
export class UserConcernsService {
  constructor(
    @InjectRepository(UserEntity, "online")
    private readonly users: Repository<UserEntity>,
    private readonly admins: AdminsService,
    private readonly adminScope: AdminScopeService,
  ) {}

  async create(
    userId: number,
    dto: {
      concernType: string;
      category: string;
      subject: string;
      message: string;
      email?: string;
      rating?: number;
    }
  ) {
    const user = await this.users.findOne({ where: { userId } });
    if (!user) throw new NotFoundException("User not found");

    const rows = (await this.users.query(
      `INSERT INTO user_concerns (
         user_id, username, concern_type, category, subject, message,
         email, rating, company, department, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open')
       RETURNING
         concern_id AS "id",
         user_id AS "userId",
         username,
         concern_type AS "concernType",
         category,
         subject,
         message,
         email,
         rating,
         company,
         department,
         status,
         created_at AS "timestamp"`,
      [
        userId,
        user.username,
        dto.concernType,
        dto.category,
        dto.subject,
        dto.message,
        dto.email ?? user.email ?? null,
        dto.rating ?? null,
        user.company ?? null,
        user.department ?? null
      ]
    )) as ConcernRow[];

    return rows[0];
  }

  async listForActor(actor: ScopedActor, pagination?: PaginationInput) {
    if (isSuperAdmin(actor.role)) {
      return queryScopedList<ConcernRow>(this.users, {
        baseSql: `
       SELECT
         c.concern_id AS "id",
         c.user_id AS "userId",
         c.username,
         c.concern_type AS "concernType",
         c.category,
         c.subject,
         c.message,
         c.email,
         c.rating,
         COALESCE(c.company, u.company) AS company,
         COALESCE(c.department, u.department) AS department,
         c.status,
         c.created_at AS "timestamp",
         c.admin_reply AS "adminReply",
         c.replied_at AS "repliedAt",
         COALESCE(c.reply_read, true) AS "replyRead"
       FROM user_concerns c
       LEFT JOIN users u ON u.user_id = c.user_id`,
        params: [],
        orderSql: "ORDER BY c.created_at DESC",
        pagination,
      });
    }

    const scope = await this.adminScope.resolveScope(actor);
    if (!scope?.department) return [];

    const params: unknown[] = [];
    const where = appendAdminRecordScope(
      "1=1",
      scope,
      "COALESCE(c.company, u.company)",
      "COALESCE(c.department, u.department)",
      params,
    );

    return queryScopedList<ConcernRow>(this.users, {
      baseSql: `
       SELECT
         c.concern_id AS "id",
         c.user_id AS "userId",
         c.username,
         c.concern_type AS "concernType",
         c.category,
         c.subject,
         c.message,
         c.email,
         c.rating,
         COALESCE(c.company, u.company) AS company,
         COALESCE(c.department, u.department) AS department,
         c.status,
         c.created_at AS "timestamp",
         c.admin_reply AS "adminReply",
         c.replied_at AS "repliedAt",
         COALESCE(c.reply_read, true) AS "replyRead"
       FROM user_concerns c
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE ${where}`,
      params,
      orderSql: "ORDER BY c.created_at DESC",
      pagination,
    });
  }

  async listForAdmin(adminId?: number | null, role?: string, pagination?: PaginationInput) {
    if (role === "superadmin") {
      return this.listForActor(
        { role: "superadmin", sub: 0, userId: 0, username: "superadmin" },
        pagination,
      );
    }

    if (role === "admin" && adminId) {
      const admin = await this.admins.findById(adminId);
      const scope = buildAdminScope(admin);
      if (!scope?.department) return [];

      return this.listForActor(
        {
          role: "admin",
          sub: adminId,
          userId: adminId,
          username: admin?.username ?? "admin",
          company: scope.company,
          department: scope.department,
        },
        pagination,
      );
    }

    return [];
  }

  async listForUser(userId: number) {
    return this.users.query(
      `SELECT
         c.concern_id AS "id",
         c.user_id AS "userId",
         c.username,
         c.concern_type AS "concernType",
         c.category,
         c.subject,
         c.message,
         c.email,
         c.rating,
         COALESCE(c.company, u.company) AS company,
         COALESCE(c.department, u.department) AS department,
         c.status,
         c.created_at AS "timestamp",
         c.admin_reply AS "adminReply",
         c.replied_at AS "repliedAt",
         COALESCE(c.reply_read, true) AS "replyRead"
       FROM user_concerns c
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    ) as Promise<ConcernRow[]>;
  }

  async markReplyRead(id: number, userId: number) {
    const rows = (await this.users.query(
      `UPDATE user_concerns
       SET reply_read = true
       WHERE concern_id = $1
         AND user_id = $2
       RETURNING concern_id AS "id"`,
      [id, userId]
    )) as Array<{ id: number }>;

    if (!rows[0]) throw new NotFoundException("Concern not found");
    return { success: true };
  }

  async updateStatusForActor(
    actor: ScopedActor,
    id: number,
    status: string,
    adminReply?: string,
  ) {
    if (!isSuperAdmin(actor.role)) {
      const existingRows = (await this.users.query(
        `SELECT
           c.concern_id AS id,
           COALESCE(c.company, u.company) AS company,
           COALESCE(c.department, u.department) AS department
         FROM user_concerns c
         LEFT JOIN users u ON u.user_id = c.user_id
         WHERE c.concern_id = $1
         LIMIT 1`,
        [id],
      )) as Array<{ id: number; company: string | null; department: string | null }>;

      if (!existingRows[0]) throw new NotFoundException("Concern not found");

      await this.adminScope.assertRecordInScope(
        actor,
        existingRows[0],
        "You can only update help concerns from your assigned department.",
      );
    }

    return this.updateStatus(id, status, adminReply);
  }

  async updateStatus(id: number, status: string, adminReply?: string) {
    const rows = (await this.users.query(
      adminReply
        ? `UPDATE user_concerns
           SET status = $2,
               admin_reply = $3,
               replied_at = NOW(),
               reply_read = false
           WHERE concern_id = $1
           RETURNING
             concern_id AS "id",
             user_id AS "userId",
             username,
             concern_type AS "concernType",
             category,
             subject,
             message,
             email,
             rating,
             company,
             department,
             status,
             created_at AS "timestamp",
             admin_reply AS "adminReply",
             replied_at AS "repliedAt",
             COALESCE(reply_read, true) AS "replyRead"`
        : `UPDATE user_concerns
           SET status = $2
           WHERE concern_id = $1
           RETURNING
             concern_id AS "id",
             user_id AS "userId",
             username,
             concern_type AS "concernType",
             category,
             subject,
             message,
             email,
             rating,
             company,
             department,
             status,
             created_at AS "timestamp",
             admin_reply AS "adminReply",
             replied_at AS "repliedAt",
             COALESCE(reply_read, true) AS "replyRead"`,
      adminReply ? [id, status, adminReply] : [id, status]
    )) as ConcernRow[];

    if (!rows[0]) throw new NotFoundException("Concern not found");
    return rows[0];
  }
}
