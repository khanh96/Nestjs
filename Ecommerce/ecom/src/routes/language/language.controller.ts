import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { LanguageService } from './language.service'
import {
  CreateLanguageBodyDto,
  GetLanguageDetailResponseDto,
  GetLanguageParamsDto,
  GetLanguagesResponseDto,
  UpdateLanguageBodyDto,
} from 'src/routes/language/language.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @ZodSerializerDto(GetLanguageDetailResponseDto)
  async create(@Body() body: CreateLanguageBodyDto, @ActiveUser() activeUser: AccessTokenPayload) {
    const { userId } = activeUser
    const result = await this.languageService.create({ ...body, userId })
    return result
  }

  @MessageRes('Get all languages successfully')
  @Get()
  @ZodSerializerDto(GetLanguagesResponseDto)
  async findAll() {
    const result = await this.languageService.findAll()
    return result
  }

  @MessageRes('Get language detail successfully')
  @ZodSerializerDto(GetLanguageDetailResponseDto)
  @Get(':languageId')
  async findOne(@Param() { languageId }: GetLanguageParamsDto) {
    const result = await this.languageService.findOne(languageId)
    return result
  }

  // Không cho phép cập nhật id: Vì id là mã ngôn ngữ do người dùng tạo (ví dụ: "en","vi",...) nó nên bất biến (immutable). Nếu cần thay đổi id, Bạn nên xóa ngôn ngữ cũ và tạo một ngôn ngữ mới với id mới.

  @MessageRes('Update language successfully')
  @ZodSerializerDto(GetLanguageDetailResponseDto)
  @Patch(':languageId')
  async update(
    @Param() { languageId }: GetLanguageParamsDto,
    @Body() updateLanguageDto: UpdateLanguageBodyDto,
    @ActiveUser() activeUser: AccessTokenPayload,
  ) {
    const { userId } = activeUser
    const { name } = updateLanguageDto
    const result = await this.languageService.update({ languageId, name, userId })
    return result
  }

  // Kiểm tra soft delete: Theo nguyên tắc chung của soft delete, chúng ta sẽ không xóa dữ liệu khỏi cơ sở dữ liệu mà chỉ đánh dấu nó là đã bị xóa và không nên cho phép cập nhật bản ghi đã bị xóa trừ khi có yêu cầu đặc biệt (ví dụ: khôi phục hoặc chỉnh sửa dữ liệu lich sử)

  @Delete(':languageId')
  @MessageRes('Delete language successfully')
  @ZodSerializerDto(MessageResponseDto)
  async remove(@Param() { languageId }: GetLanguageParamsDto, @ActiveUser() activeUser: AccessTokenPayload) {
    const { userId } = activeUser
    const result = await this.languageService.remove({ languageId, userId })
    return result
  }
}
