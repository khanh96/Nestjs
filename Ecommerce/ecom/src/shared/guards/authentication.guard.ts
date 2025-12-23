import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthType, AuthTypeDecoratorPayload, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AUTH_TYPE_KEY } from 'src/shared/decorators/auth.decorator'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { PaymentAPIKeyGuard } from 'src/shared/guards/payment-api-key.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
    private readonly paymentAPIKeyGuard: PaymentAPIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard, // Default khi không có @Auth()
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.PaymentAPIKey]: this.paymentAPIKeyGuard, // Khi có @Auth([AuthType.PaymentAPIKey])
      [AuthType.None]: { canActivate: () => true }, // No authentication required
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context)
    // console.log('authTypeValue', authTypeValue)
    // Từ authTypeValue.authTypes lấy ra các guard tương ứng
    const guards = authTypeValue.authTypes.map((authType) => {
      return this.authTypeGuardMap[authType]
    })

    const authResult =
      authTypeValue.options.condition === ConditionGuard.OR
        ? this.handleOrCondition(guards, context)
        : this.handleAndCondition(guards, context)
    return authResult
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.AND } }
    return authTypeValue
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
    // Duyệt qua hết các guard, nếu mọi guard pass thì return true
    for (const instance of guards) {
      try {
        if (!(await instance.canActivate(context))) {
          throw new UnauthorizedException()
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw new UnauthorizedException()
      }
    }
    return true
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
    let lastError: any = null
    // Duyệt qua hết các guard, nếu có 1 guard pass thì return true
    for (const instance of guards) {
      try {
        if (await instance.canActivate(context)) {
          return true
        }
      } catch (error) {
        lastError = error
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError
    }
    throw new UnauthorizedException()
  }
}
