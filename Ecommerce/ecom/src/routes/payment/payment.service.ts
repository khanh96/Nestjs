import { Injectable } from '@nestjs/common'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentRepository } from 'src/routes/payment/payment.repo'

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}
  receiver(body: WebhookPaymentBodyType) {
    return this.paymentRepository.receiver(body)
  }
}
