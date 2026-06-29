import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/admin-notifications', cors: { origin: process.env.WS_CORS_ORIGIN ?? '*' } })
export class AdminNotificationsGateway {
  @WebSocketServer()
  server!: Server;

  emitDeviceInactive(payload: { deviceId: string; userId: string }) {
    this.server.emit('device.inactive', payload);
  }

  emitKeyUsed(payload: { keyId: string; usedBy: string }) {
    this.server.emit('key.used', payload);
  }

  emitSyncProgress(payload: { userId: string; progress: number }) {
    this.server.emit('sync.progress', payload);
  }
}
