import { createZodDto } from 'nestjs-zod'
import {
  RegisterBodySchema,
  RegisterResponseSchema,
  LoginBodySchema,
  LogoutBodySchema,
} from 'src/routes/auth/auth.model'

/**
 * Sử dụng file .dto để validate request body trước khi chạy vào controller
 */
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

export class LoginBodyDto extends createZodDto(LoginBodySchema) {}

export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}

export class RefreshTokenBodyDto extends createZodDto(LogoutBodySchema) {}
