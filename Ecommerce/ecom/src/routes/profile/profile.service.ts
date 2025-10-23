import { Injectable } from '@nestjs/common'
import { ChangePasswordBodyType, UpdateProfileBodyType } from 'src/routes/profile/profile.model'
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/error'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { ShareUserRepository } from 'src/shared/repositories/user.repo'
import { HashingService } from 'src/shared/services/hashing/hashing.service'

@Injectable()
export class ProfileService {
  constructor(
    private readonly shareUserRepository: ShareUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.shareUserRepository.findUniqueIncludeRolePermissions({
      id: userId,
    })
    if (!user) {
      throw NotFoundRecordException
    }
    return user
  }

  async updateProfile(userId: number, body: UpdateProfileBodyType) {
    try {
      const user = await this.shareUserRepository.update(
        {
          id: userId,
        },
        {
          ...body,
          updatedById: userId,
        },
      )
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async changePassword(userId: number, body: ChangePasswordBodyType) {
    const { password, newPassword } = body
    // 1. Check user exists
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw NotFoundRecordException
    }
    // 2. Check if old password matches
    const isPasswordMatch = await this.hashingService.compare(password, user.password)

    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }
    // 3. Hash new password
    const hashedPassword = await this.hashingService.hash(newPassword)

    // 4. Update password with new password
    await this.shareUserRepository.update(
      { id: userId },
      {
        password: hashedPassword,
        updatedById: userId,
      },
    )
  }
}
