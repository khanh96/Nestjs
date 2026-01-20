import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { Request } from 'express'
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    // const ctx = context.switchToHttp()
    // const request = ctx.getRequest<Request>()
    let request: any
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context)
      request = gqlContext.getContext().req
    } else {
      request = context.switchToHttp().getRequest()
    }
    const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY]
    return field ? user?.[field] : user
  },
)
