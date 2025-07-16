import { Body, Controller, Get, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ChangePasswordBodyDTO, UpdateProfileBodyDto } from 'src/routes/profile/profile.dto'
import { ProfileService } from 'src/routes/profile/profile.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { GetUserProfileResDto, UpdateProfileResDto } from 'src/shared/dto/user.dto'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @MessageRes('Get profile successfully')
  @Get()
  @ZodSerializerDto(GetUserProfileResDto)
  async getProfile(@ActiveUser() activeUser: AccessTokenPayload) {
    const { userId } = activeUser
    const result = await this.profileService.getProfile(userId)
    return result
  }

  @MessageRes('Update profile successfully')
  @Put()
  @ZodSerializerDto(UpdateProfileResDto)
  updateProfile(@ActiveUser() activeUser: AccessTokenPayload, @Body() body: UpdateProfileBodyDto) {
    const { userId } = activeUser
    return this.profileService.updateProfile(userId, body)
  }

  @MessageRes('Change password successfully')
  @Put('change-password')
  changePassword(@ActiveUser() activeUser: AccessTokenPayload, @Body() body: ChangePasswordBodyDTO) {
    const { userId } = activeUser
    return this.profileService.changePassword(userId, body)
  }
}
