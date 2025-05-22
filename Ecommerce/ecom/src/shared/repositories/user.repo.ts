import { Injectable } from '@nestjs/common'
import { Role, User } from '@prisma/client'
import { UserType } from 'src/shared/models/user.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

type UserWithRole = User & {
  role: Role
}

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserWithRole | null> {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    })
  }

  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
}
