import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Server, Socket } from "socket.io";
import { normalizeScopeValue } from "../../shared/admin-scope";
import type { JwtPayload } from "../../shared/types";

type ScopedEventPayload = {
  company?: string | null;
  department?: string | null;
  userId?: number | null;
  [key: string]: unknown;
};

@Injectable()
@WebSocketGateway({ cors: { origin: "*" }, namespace: "/events" })
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    const rawToken =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined);

    if (!rawToken?.trim()) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwt.verify(rawToken.trim()) as JwtPayload;
      client.data.user = payload;

      if (payload.role === "superadmin") {
        void client.join(this.superAdminRoom());
        return;
      }

      if (payload.role === "admin" && payload.company?.trim() && payload.department?.trim()) {
        void client.join(this.adminRoom(payload.company, payload.department));
        return;
      }

      if (payload.role === "user") {
        void client.join(this.userRoom(payload.sub));
        return;
      }

      client.disconnect(true);
    } catch (error) {
      this.logger.debug(`Rejected websocket connection: ${String(error)}`);
      client.disconnect(true);
    }
  }

  private superAdminRoom() {
    return "role:superadmin";
  }

  private adminRoom(company: string, department: string) {
    return `admin:${normalizeScopeValue(company)}:${normalizeScopeValue(department)}`;
  }

  private userRoom(userId: number) {
    return `user:${userId}`;
  }

  private emitScoped(event: string, payload: ScopedEventPayload) {
    this.server?.to(this.superAdminRoom()).emit(event, payload);

    if (payload.company?.trim() && payload.department?.trim()) {
      this.server
        ?.to(this.adminRoom(payload.company, payload.department))
        .emit(event, payload);
    }

    if (payload.userId) {
      this.server?.to(this.userRoom(payload.userId)).emit(event, payload);
    }
  }

  emitDeviceHeartbeat(payload: ScopedEventPayload) {
    this.emitScoped("device:heartbeat", payload);
  }

  emitDeviceInactive(payload: ScopedEventPayload) {
    this.emitScoped("device:inactive", payload);
  }

  emitSyncProgress(payload: ScopedEventPayload) {
    this.emitScoped("sync:progress", payload);
  }

  emitStorageWarning(payload: ScopedEventPayload) {
    this.emitScoped("storage:warning", payload);
  }

  emitKeyUsed(payload: ScopedEventPayload) {
    this.emitScoped("key:used", payload);
  }

  emitKeyExtension(payload: ScopedEventPayload & {
    eventType?: string;
    title?: string;
    message?: string;
    data?: Record<string, unknown>;
  }) {
    this.emitScoped("key:extension", payload);
    if (payload.eventType) {
      this.server?.to(this.superAdminRoom()).emit(payload.eventType, payload);
    }
  }

  emitBackupComplete(payload: unknown) {
    this.server?.to(this.superAdminRoom()).emit("backup:complete", payload);
  }

  emitBackupFailed(payload: unknown) {
    this.server?.to(this.superAdminRoom()).emit("backup:failed", payload);
  }
}
