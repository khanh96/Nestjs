import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthType, AuthTypeDecoratorPayload, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AUTH_TYPE_KEY } from 'src/shared/decorators/auth.decorator'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true }, // No authentication required
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.AND } }
    // console.log('authTypeValue', authTypeValue)
    // Từ authTypeValue.authTypes lấy ra các guard tương ứng
    const guards = authTypeValue.authTypes.map((authType) => {
      return this.authTypeGuardMap[authType]
    })
    let error = new UnauthorizedException()
    if (authTypeValue.options.condition === ConditionGuard.OR) {
      for (const instance of guards) {
        // Sủ dụng Promise.resolve để bắt lỗi. Cho dù guard nào trả về lỗi thì vẫn tiếp tục kiểm tra các guard còn lại
        const canActivate = await Promise.resolve(instance.canActivate(context)).catch((err) => {
          error = err
          console.log('error1', error)
          return false
        })

        if (canActivate) {
          return true
        }
      }
      throw error
    } else {
      for (const instance of guards) {
        const canActivate = await Promise.resolve(instance.canActivate(context)).catch((err) => {
          error = err
          return false
        })
        if (!canActivate) {
          throw new UnauthorizedException()
        }
      }
      return true
    }
  }
}
