import { ThrottlerGuard } from '@nestjs/throttler'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlContextType } from '@nestjs/graphql'

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<GqlContextType>() === 'graphql') {
      return Promise.resolve(true)
    }
    return super.canActivate(context)
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip // individualize IP extraction to meet your own needs
  }
}
