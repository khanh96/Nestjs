import { Injectable } from '@nestjs/common'
import { LanguageType } from 'src/routes/language/language.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createLanguage(data: Pick<LanguageType, 'id' | 'name' | 'createdById'>): Promise<LanguageType> {
    return await this.prismaService.language.create({ data })
  }

  async findById({ id }: Pick<LanguageType, 'id'>): Promise<LanguageType | null> {
    return await this.prismaService.language.findUnique({
      where: {
        id,
        deletedAt: null, // Ensure we only fetch non-deleted languages
      },
    })
  }

  async findAll(): Promise<LanguageType[]> {
    return await this.prismaService.language.findMany({
      orderBy: {
        name: 'asc',
      },
      where: {
        deletedAt: null, // Ensure we only fetch non-deleted languages
      },
    })
  }
  async remove({
    id,
    data,
    isHard,
  }: {
    id: string
    isHard: boolean
    data?: Partial<LanguageType>
  }): Promise<LanguageType> {
    if (isHard) {
      return await this.prismaService.language.delete({
        where: {
          id,
        },
      })
    } else {
      return await this.prismaService.language.update({
        where: {
          id,
          deletedAt: null, // Ensure we only soft delete if not already deleted
        },
        data: data || {},
      })
    }
  }

  async update(where: Pick<LanguageType, 'id'>, data: Partial<LanguageType>): Promise<LanguageType> {
    return await this.prismaService.language.update({
      where: {
        id: where.id,
        deletedAt: null, // Ensure we only update non-deleted languages
      },
      data,
    })
  }
}
