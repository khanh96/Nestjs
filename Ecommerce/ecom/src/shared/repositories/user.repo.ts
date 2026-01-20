import { Injectable } from '@nestjs/common'
import { PermissionType } from 'src/shared/models/permission.model'
import { RoleType } from 'src/shared/models/role.model'
import { UserType } from 'src/shared/models/user.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

type UserWithRole = UserType & {
  role: RoleType
}

export type WhereUniqueUserType =
  | ({ id: number } & { [K in keyof UserType]?: UserType[K] })
  | ({ email: string } & { [K in keyof UserType]?: UserType[K] })

type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & {
    permissions: PermissionType[]
  }
}

@Injectable()
export class ShareUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmailIncludeRole(email: string): Promise<UserWithRole | null> {
    return (await this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    })) as UserWithRole | null
  }

  async findUnique(uniqueObject: WhereUniqueUserType): Promise<UserType | null> {
    return (await this.prismaService.user.findUnique({
      where: {
        ...uniqueObject,
        deletedAt: null, // Ensure we only fetch non-deleted users
      },
    })) as UserType | null
  }

  async findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    const result = await this.prismaService.user.findFirst({
      where: {
        ...where,
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null, // Ensure we only fetch non-deleted permissions
              },
            },
          },
        },
      },
    })
    return result as UserIncludeRolePermissionsType | null
  }

  async update(where: WhereUniqueUserType, data: Partial<UserType>): Promise<UserType> {
    return (await this.prismaService.user.update({
      where: {
        id: where.id,
        deletedAt: null, // Ensure we only update non-deleted users
      },
      data: {
        ...data,
        updatedAt: new Date(), // Update the timestamp
      },
    })) as any
  }
}
