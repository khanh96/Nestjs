import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { TokenService } from 'src/shared/services/token/token.service'

@Injectable()
export class APIKeyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const apiKey = request.headers['x-api-key']

    // Check if the token is present
    if (apiKey !== envConfig.API_KEY) {
      throw new UnauthorizedException('API key is missing or invalid')
    }
    return true
  }
}
