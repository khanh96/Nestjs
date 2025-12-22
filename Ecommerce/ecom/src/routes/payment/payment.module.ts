import { Module } from '@nestjs/common'
import { PaymentController } from 'src/routes/payment/payment.controller'
import { PaymentRepository } from 'src/routes/payment/payment.repo'
import { PaymentService } from 'src/routes/payment/payment.service'

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
