import { Global, Module } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'
import { TokenService } from './services/token/token.service'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { UserRepository } from 'src/shared/repositories/user.repo'
import { EmailService } from 'src/shared/services/email/email.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  AccessTokenGuard,
  APIKeyGuard,
  UserRepository,
  EmailService,
]

// Để sử dụng được PrismaService ở các module khác, cần phải import SharedModule vào module đó
// global để có thể sử dụng ở bất kỳ module nào mà không cần import SharedModule vào module đó
@Global()
@Module({
  providers: [
    ...sharedServices,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices, // để có thể sử dụng PrismaService ở các module khác,
  // cần phải import SharedModule vào module đó
  imports: [JwtModule],
})
export class SharedModule {}
