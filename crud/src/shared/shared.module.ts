import { Global, Module } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'
import { TokenService } from './services/token/token.service'
import { JwtModule } from '@nestjs/jwt'

const sharedServices = [PrismaService, HashingService, TokenService]

// Để sử dụng được PrismaService ở các module khác, cần phải import SharedModule vào module đó
// global để có thể sử dụng ở bất kỳ module nào mà không cần import SharedModule vào module đó
@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices, // để có thể sử dụng PrismaService ở các module khác,
  // cần phải import SharedModule vào module đó
  imports: [JwtModule],
})
export class SharedModule {}
