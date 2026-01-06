import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class RemoveRefreshTokenCronjob {
  private readonly logger = new Logger(RemoveRefreshTokenCronjob.name)
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * A cron job that runs every second to remove expired refresh tokens from the database.
   * This helps in maintaining database hygiene and security by ensuring that
   * expired tokens are not lingering in the system.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    const refreshTokens = await this.prismaService.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
    this.logger.debug(`Removed ${refreshTokens.count} expired refresh tokens.`)
  }
}
