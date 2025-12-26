import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class ShareWebsocketRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: { id: string; userId: number }) {
    return this.prismaService.websocket.create({
      data: {
        id: data.id,
        userId: data.userId,
      },
    })
  }

  delete(id: string) {
    return this.prismaService.websocket.delete({
      where: {
        id,
      },
    })
  }
}
