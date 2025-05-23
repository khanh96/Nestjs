import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import requestIp from 'request-ip'

/**
 *
 * Sử dụng decorator này để lấy địa chỉ IP của người dùng
 * Địa chỉ IP sẽ được lấy từ request headers
 * Nếu không có địa chỉ IP thì trả về null
 *
 */

export const IpAddress = createParamDecorator((data, ctx: ExecutionContext): string | null => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const ipAddress = requestIp.getClientIp(request)
  return ipAddress ? String(ipAddress) : null
})
