import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from 'src/shared/config'

@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const apiKey = request.headers['payment-api-key']

    // Check if the token is present
    if (apiKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException('Payment API key is missing or invalid')
    }
    return true
  }
}
