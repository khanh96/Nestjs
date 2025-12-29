import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentRepository } from 'src/routes/payment/payment.repo'
import { SharedWebsocketRepository } from 'src/shared/repositories/websocket.repo'
import { Server } from 'socket.io'

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly sharedWebsocketRepository: SharedWebsocketRepository,
  ) {}
  async receiver(body: WebhookPaymentBodyType) {
    const { message, userId } = await this.paymentRepository.receiver(body)

    try {
      // Gửi thông báo qua websocket
      const websockets = await this.sharedWebsocketRepository.findMany(userId)
      // Gửi thông báo đến tất cả các websocket của user
      websockets.forEach((ws) => {
        this.server.to(ws.id).emit('status-payment', {
          status: 'success',
        })
      })
    } catch (error) {
      console.log(error)
    }

    return message
  }
}
