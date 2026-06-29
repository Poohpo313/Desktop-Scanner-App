import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import { AdminEntity } from "./entities/admin.entity";

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity, "online")
    private readonly admins: Repository<AdminEntity>
  ) {}

  findAll() {
    return this.admins.find({
      where: { accountStatus: "active" },
      order: { createdAt: "DESC" }
    });
  }

  findDeleted() {
    return this.admins.find({
      where: { accountStatus: "deleted" },
      order: { createdAt: "DESC" }
    });
  }

  async create(data: {
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: number;
  }) {
    const entity = this.admins.create({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
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
      lastName: string;
      email: string;
      roleId: number;
      accountStatus: string;
    }>
  ) {
    await this.admins.update({ adminId: id }, data);
    return this.admins.findOne({ where: { adminId: id } });
  }

  async softDelete(id: number) {
    const admin = await this.admins.findOne({ where: { adminId: id } });
    if (!admin) throw new NotFoundException("Admin not found");
    admin.accountStatus = "deleted";
    return this.admins.save(admin);
  }

  async restore(id: number) {
    const admin = await this.admins.findOne({ where: { adminId: id } });
    if (!admin) throw new NotFoundException("Admin not found");
    admin.accountStatus = "active";
    return this.admins.save(admin);
  }

  async permanentDelete(id: number) {
    const result = await this.admins.delete({ adminId: id });
    if (!result.affected) throw new NotFoundException("Admin not found");
    return { success: true };
  }
}
