import { Body, Controller, Post } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'
// import { ZodSerializerDto } from 'nestjs-zod'
import { WebhookPaymentBodyDTO } from 'src/routes/payment/payment.dto'
import { PaymentService } from 'src/routes/payment/payment.service'
import { AuthType } from 'src/shared/constants/auth.constant'
import { Auth } from 'src/shared/decorators/auth.decorator'
// import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('payment')
@ApiSecurity('payment-api-key')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  // @ZodSerializerDto(MessageResponseDto)
  // @IsPublic()
  @Auth([AuthType.PaymentAPIKey])
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}
