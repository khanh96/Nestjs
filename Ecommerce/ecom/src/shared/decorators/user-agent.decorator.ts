import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

/**
 * Sử dụng decorator này để lấy thông tin user agent từ request người dùng
 *
 */

export const UserAgent = createParamDecorator((data, ctx: ExecutionContext): string | null => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const userAgent = request.headers['user-agent']
  return userAgent ? String(userAgent) : null
})
