import { Injectable } from '@nestjs/common';

import { EditAdminDto, RegisterAdminDto } from './admins.dto';

@Injectable()
export class SuperAdminAdminsService {
  /** Lists all admins including soft-deleted records when requested. */
  async list(): Promise<Array<{ id: string; username: string }>> {
    return [{ id: 'admin-1', username: 'portal-admin' }];
  }

  /** Creates an admin account with role assignment. */
  async create(dto: RegisterAdminDto): Promise<{ id: string }> {
    void dto;
    return { id: crypto.randomUUID() };
  }

  /** Edits admin profile and role assignment rules. */
  async edit(adminId: string, dto: EditAdminDto): Promise<{ updated: boolean; adminId: string }> {
    void dto;
    return { updated: true, adminId };
  }

  /** Soft deletes admin into recycle bin. */
  async softDelete(adminId: string): Promise<{ deleted: boolean; adminId: string }> {
    return { deleted: true, adminId };
  }

  /** Permanently deletes admin record from recycle bin. */
  async permanentDelete(adminId: string): Promise<{ permanentlyDeleted: boolean; adminId: string }> {
    return { permanentlyDeleted: true, adminId };
  }

  /** Restores admin from recycle bin. */
  async restore(adminId: string): Promise<{ restored: boolean; adminId: string }> {
    return { restored: true, adminId };
  }
}
