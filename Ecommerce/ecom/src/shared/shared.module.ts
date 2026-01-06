import { CacheModule } from '@nestjs/cache-manager'
import { JwtModule } from '@nestjs/jwt'
import { Global, Module } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'
import { TokenService } from './services/token/token.service'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { ShareUserRepository } from 'src/shared/repositories/user.repo'
import { EmailService } from 'src/shared/services/email/email.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa/2fa.service'
import { ShareRoleRepository } from 'src/shared/repositories/role.repo'
import { S3Service } from 'src/shared/services/s3/s3.service'
import { PaymentAPIKeyGuard } from 'src/shared/guards/payment-api-key.guard'
import { SharedPaymentRepository } from 'src/shared/repositories/payment.repo'
import { SharedWebsocketRepository } from 'src/shared/repositories/websocket.repo'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  AccessTokenGuard,
  APIKeyGuard,
  ShareUserRepository,
  ShareRoleRepository,
  EmailService,
  TwoFactorAuthService,
  S3Service,
  PaymentAPIKeyGuard,
  SharedPaymentRepository,
  SharedWebsocketRepository,
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
  imports: [
    JwtModule,
    CacheModule.register({
      isGlobal: true,
    }),
  ],
})
export class SharedModule {}
