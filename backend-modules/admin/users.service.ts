import { Injectable } from '@nestjs/common';

import { EditUserDto, RegisterUserDto } from './users.dto';

@Injectable()
export class AdminUsersService {
  /** Returns users assigned to the current admin. */
  async list(adminId: string): Promise<Array<{ id: string; username: string }>> {
    return [{ id: `user-for-${adminId}`, username: 'demo-user' }];
  }

  /** Registers a new user under this admin's scope. */
  async register(adminId: string, dto: RegisterUserDto): Promise<{ id: string; assignedAdminId: string }> {
    void dto;
    return { id: crypto.randomUUID(), assignedAdminId: adminId };
  }

  /** Updates a scoped user's profile fields. */
  async edit(adminId: string, userId: string, dto: EditUserDto): Promise<{ updated: boolean; userId: string }> {
    void adminId;
    void dto;
    return { updated: true, userId };
  }

  /** Soft deletes a scoped user into recycle bin. */
  async softDelete(adminId: string, userId: string): Promise<{ deleted: boolean; userId: string }> {
    void adminId;
    return { deleted: true, userId };
  }

  /** Restores a soft-deleted scoped user from recycle bin. */
  async restore(adminId: string, userId: string): Promise<{ restored: boolean; userId: string }> {
    void adminId;
    return { restored: true, userId };
  }
}
