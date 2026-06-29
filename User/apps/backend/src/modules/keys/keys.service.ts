import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { SerialKeyEntity } from "./entities/key.entity";

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(SerialKeyEntity, "online")
    private readonly keys: Repository<SerialKeyEntity>
  ) {}

  generateKey(): string {
    const raw = uuidv4().replace(/-/g, "").toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
  }

  async generate() {
    const entity = this.keys.create({
      serialKey: this.generateKey(),
      status: "unused"
    });
    return this.keys.save(entity);
  }

  findAll() {
    return this.keys.find({ order: { generatedAt: "DESC" } });
  }

  async assign(serialId: number, userId: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    key.assignedTo = userId;
    key.status = "assigned";
    return this.keys.save(key);
  }

  async revoke(serialId: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    key.status = "revoked";
    return this.keys.save(key);
  }

  async deactivate(serialId: number) {
    const key = await this.keys.findOne({ where: { serialId } });
    if (!key) throw new BadRequestException("Key not found");
    key.status = "deactivated";
    return this.keys.save(key);
  }

  async generateBulk(count: number) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(await this.generate());
    }
    return items;
  }

  async validateUnused(serialKey: string) {
    const key = await this.keys.findOne({ where: { serialKey } });
    if (!key) throw new BadRequestException("Invalid serial key");
    if (key.status !== "unused") {
      throw new BadRequestException(`Serial key is ${key.status}`);
    }
    return key;
  }
}
