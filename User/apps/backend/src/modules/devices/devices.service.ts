import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DeviceEntity } from "./entities/device.entity";

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity, "online")
    private readonly devices: Repository<DeviceEntity>
  ) {}

  findAll() {
    return this.devices.find({ order: { lastSeen: "DESC" } });
  }

  async flagInactive(id: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    device.status = "inactive";
    return this.devices.save(device);
  }

  async revoke(id: number) {
    const device = await this.devices.findOne({ where: { deviceId: id } });
    if (!device) throw new NotFoundException("Device not found");
    device.status = "unauthorized";
    return this.devices.save(device);
  }

  exportCsv() {
    return this.findAll();
  }
}
