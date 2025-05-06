import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'
import { TokenPayload } from 'src/shared/types/jwt.type'

export const ActiveUser = createParamDecorator((field: keyof TokenPayload | undefined, context: ExecutionContext) => {
  const ctx = context.switchToHttp()
  const request = ctx.getRequest<Request>()
  const user: TokenPayload | undefined = request[REQUEST_USER_KEY]
  return field ? user?.[field] : user
})
