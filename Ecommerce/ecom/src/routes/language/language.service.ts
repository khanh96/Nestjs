import { Injectable } from '@nestjs/common'
import { LanguageAlreadyExistsException, LanguageNotFoundException } from 'src/routes/language/language.error'
import {
  CreateLanguageBodyType,
  GetLanguagesResType,
  LanguageType,
  UpdateLanguageBodyType,
} from 'src/routes/language/language.model'
import { LanguageRepository } from 'src/routes/language/language.repo'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async create(body: CreateLanguageBodyType & { userId: number }) {
    const { id, name, userId } = body
    // 1. Create Language
    try {
      const result = await this.languageRepository.createLanguage({
        id,
        name,
        createdById: userId,
      })
      return result
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException(id)
      }
      throw error // Re-throw other unexpected errors
    }
  }

  async findAll(): Promise<GetLanguagesResType> {
    // 1. Find all Languages
    const result = await this.languageRepository.findAll()

    return {
      data: result,
      totalItems: result.length,
    }
  }

  async findOne(id: string) {
    // 1. Find Language by ID
    try {
      const result = await this.languageRepository.findById({ id })
      return result
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundException
      }
      throw error // Re-throw other unexpected errors
    }
  }

  // TODO:
  async update({ name, userId, languageId }: UpdateLanguageBodyType & { userId: number; languageId: string }) {
    // 1. Check if lang exists in DB
    const language = await this.languageRepository.findById({ id: languageId })
    if (!language) {
      throw LanguageNotFoundException
    }
    // 2. Update Language by ID
    const newLanguage = await this.languageRepository.update(
      {
        id: language.id,
      },
      {
        name,
        updatedById: userId,
      },
    )
    // 3. Return updated language
    return newLanguage
  }

  async remove({ languageId, userId }: { languageId: string; userId: number }): Promise<{ message: string }> {
    // 1. Remove Language by ID
    try {
      const isHard = false // Default to soft delete
      let removeParams: {
        id: string
        isHard: boolean
        data?: Partial<LanguageType>
      } = { id: languageId, isHard }
      if (!isHard) {
        removeParams = { id: languageId, isHard, data: { deletedById: userId, deletedAt: new Date() } }
      }
      const result = await this.languageRepository.remove(removeParams)

      return {
        message: `Language with ID ${result.id} has been deleted successfully.`,
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundException
      }
      throw error // Re-throw other unexpected errors
    }
  }
}
