import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({
  namespace: 'payment',
})
export class PaymentGateway {
  @WebSocketServer()
  server: Server

  // Listen for 'send-money' events from clients
  @SubscribeMessage('send-money')
  handleEvent(@MessageBody() data: { money: string }): { money: string } {
    // Emit 'receive-money' event to all connected clients
    this.server.emit('receive-money', {
      data: `Hello ${data.money}`,
    })
    return data
  }
}
