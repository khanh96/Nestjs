import { Injectable } from '@nestjs/common'
import {
  CreatePermissionBodyType,
  GetPermissionResponseType,
  GetPermissionsQueryType,
  PermissionType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class PermissionRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetPermissionsQueryType): Promise<GetPermissionResponseType> {
    const skip = (pagination.page - 1) * pagination.limit // Calculate the number of items to skip based on the current page and limit
    const take = pagination.limit // Number of items to take per page

    const [totalItems, data] = await Promise.all([
      await this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      await this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take,
      }),
    ])

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async findById(id: number): Promise<PermissionType | null> {
    const result = await this.prismaService.permission.findUnique({
      where: { id: id, deletedAt: null },
    })
    return result
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreatePermissionBodyType
  }): Promise<PermissionType> {
    const result = await this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })
    return result
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdatePermissionBodyType
  }): Promise<PermissionType> {
    const result = await this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
        updatedAt: new Date(),
      },
    })
    return result
  }

  async delete({
    id,
    deletedById,
    isHard,
  }: {
    id: number
    deletedById: number
    isHard?: boolean
  }): Promise<PermissionType> {
    if (isHard) {
      // If hard delete, remove the record completely
      const result = await this.prismaService.permission.delete({
        where: { id, deletedAt: null },
      })
      return result
    } else {
      // If soft delete, set deletedAt and deletedById
      const result = await this.prismaService.permission.update({
        where: { id, deletedAt: null },
        data: {
          deletedAt: new Date(),
          deletedById,
        },
      })
      return result
    }
  }
}
