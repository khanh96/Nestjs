import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  afterInit(server: Server) {
    console.log('WebSocket server initialized', server)
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id)
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id)
  }

  // Listen for 'send-message' events from clients
  @SubscribeMessage('send-message')
  handleEvent(@MessageBody() data: { name: string }): { name: string } {
    // Emit 'receive-message' event to all connected clients
    this.server.emit('receive-message', {
      data: `Hello ${data.name}`,
    })
    return data
  }
}
