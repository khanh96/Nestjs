import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResponseSchema } from 'src/routes/auth/auth.model'

/**
 * Sử dụng file .dto để validate request body trước khi chạy vào controller
 */
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
