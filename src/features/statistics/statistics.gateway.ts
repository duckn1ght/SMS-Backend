import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class StatisticsGateway {
  @WebSocketServer()
  server: Server;

  public activeUsers = new Set<String>();

  handleConnection(client: Socket) {
    this.activeUsers.add(client.id);
    console.log(`Client connected: ${client.id}, total: ${this.activeUsers.size}`);
    this.server.emit('activeUsers', this.activeUsers.size);
  }

  
  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}, total: ${this.activeUsers.size}`);
    this.server.emit('activeUsers', this.activeUsers.size);
  }
}
    