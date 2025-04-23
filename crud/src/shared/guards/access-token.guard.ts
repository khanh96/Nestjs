import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'
import { TokenService } from 'src/shared/services/token/token.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const authorizationHeader = request.headers['authorization']
    const accessToken = typeof authorizationHeader === 'string' ? authorizationHeader.split(' ')[1] : null // Extract the token from the Authorization header
    console.log('request=>', accessToken)

    // Check if the token is present
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing')
    }
    // Check if the token is valid
    try {
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)
      console.log('userId=>', userId)
      request[REQUEST_USER_KEY] = userId // Attach the user ID to the request object for later use
      console.log('request[REQUEST_USER_KEY]=>', request)
      return true
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid access token',
        error: error,
      })
    }
  }
}
