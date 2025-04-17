import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

const sharedServices = [PrismaService]

// Để sử dụng được PrismaService ở các module khác, cần phải import SharedModule vào module đó
// global để có thể sử dụng ở bất kỳ module nào mà không cần import SharedModule vào module đó
@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices, // để có thể sử dụng PrismaService ở các module khác
})
export class SharedModule {}
