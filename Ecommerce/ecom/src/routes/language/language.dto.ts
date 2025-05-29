import { createZodDto } from 'nestjs-zod'
import {
  CreateLanguageBodySchema,
  GetLanguageDetailResponseSchema,
  GetLanguageParamsSchema,
  GetLanguagesResponseSchema,
  UpdateLanguageBodySchema,
} from 'src/routes/language/language.model'

export class CreateLanguageBodyDto extends createZodDto(CreateLanguageBodySchema) {}
export class UpdateLanguageBodyDto extends createZodDto(UpdateLanguageBodySchema) {}

export class GetLanguageDetailResponseDto extends createZodDto(GetLanguageDetailResponseSchema) {}

export class GetLanguagesResponseDto extends createZodDto(GetLanguagesResponseSchema) {}

export class GetLanguageParamsDto extends createZodDto(GetLanguageParamsSchema) {}
