import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/super-admin-notifications', cors: { origin: process.env.WS_CORS_ORIGIN ?? '*' } })
export class SuperAdminNotificationsGateway {
  @WebSocketServer()
  server!: Server;

  emitHeartbeatWarning(payload: { deviceId: string; latencyMs: number }) {
    this.server.emit('heartbeat.warning', payload);
  }

  emitStorageWarning(payload: { usagePercent: number; threshold: number }) {
    this.server.emit('storage.warning', payload);
  }

  emitBackupEvent(payload: { backupId: string; status: string }) {
    this.server.emit('backup.event', payload);
  }
}
