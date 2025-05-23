import { VerificationCode } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/user.model'
import { z } from 'zod'

/**
 * Sử dụng file .modle để khởi tạo các model cho database
 * Đồng thời sử dụng để validate request body trước khi chạy vào controller
 * Viết riềng ra như này thì sau khi làm frontend có thể sử dụng lại
 */

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
})
  .strict()
  .extend({
    confirmPassword: z.string().min(6).max(20),
    code: z.string().length(6),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and Confirm Password must be the same',
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const LoginResponseSchema = z
  .object({
    accessToken: z.string().max(1000),
    refreshToken: z.string().max(1000),
  })
  .strict()

export const RefreshTokenSchema = z.object({
  token: z.string().max(1000),
  userId: z.number().positive(),
  deviceId: z.number().positive(),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const LogoutBodySchema = z.object({
  refreshToken: z.string().max(1000),
})

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    VerificationCode.REGISTER,
    VerificationCode.FORGOT_PASSWORD,
    VerificationCode.LOGIN,
    VerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export const DeviceSchema = z
  .object({
    id: z.number(),
    userAgent: z.string(),
    ip: z.string(),
    lastActive: z.date(),
    isActive: z.boolean(),
    userId: z.number().positive(),
    createdAt: z.date(),
  })
  .strict()

// Refresh Token Model
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type RefreshTokenBodyType = z.infer<typeof LogoutBodySchema>
export type RefreshTokenResponseType = z.infer<typeof LoginResponseSchema>

export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResponseType = z.infer<typeof LoginResponseSchema>

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>

export type VerificationCodeSchemaType = z.infer<typeof VerificationCodeSchema>
export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>

export type DeviceType = z.infer<typeof DeviceSchema>
