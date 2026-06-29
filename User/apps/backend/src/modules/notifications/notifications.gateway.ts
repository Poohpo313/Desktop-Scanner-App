import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/events" })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  emitDeviceHeartbeat(payload: unknown) {
    this.server?.emit("device:heartbeat", payload);
  }

  emitDeviceInactive(payload: unknown) {
    this.server?.emit("device:inactive", payload);
  }

  emitSyncProgress(payload: unknown) {
    this.server?.emit("sync:progress", payload);
  }

  emitStorageWarning(payload: unknown) {
    this.server?.emit("storage:warning", payload);
  }

  emitBackupComplete(payload: unknown) {
    this.server?.emit("backup:complete", payload);
  }

  emitBackupFailed(payload: unknown) {
    this.server?.emit("backup:failed", payload);
  }

  emitKeyUsed(payload: unknown) {
    this.server?.emit("key:used", payload);
  }
}
