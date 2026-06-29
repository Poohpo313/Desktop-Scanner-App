import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity, "online")
    private readonly users: Repository<UserEntity>
  ) {}

  findByUsername(username: string) {
    return this.users.findOne({ where: { username } });
  }

  async findSuperAdminByPin(pin: string) {
    const admins = await this.users.find();
    for (const admin of admins) {
      if (admin.passwordHash.startsWith("$argon2")) {
        try {
          const ok = await argon2.verify(admin.passwordHash, pin);
          if (ok) return admin;
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  findAll() {
    return this.users.find({ order: { createdAt: "DESC" } });
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
    const entity = this.users.create({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
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
    await this.users.update({ userId: id }, { accountStatus: "deleted" });
    return { success: true };
  }

  async remove(id: number) {
    await this.users.delete({ userId: id });
    return { success: true };
  }
}
