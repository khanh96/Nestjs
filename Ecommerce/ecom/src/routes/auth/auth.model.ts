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
})
  .extend({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of totpCode or code must be provided',
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of totpCode or code must be provided',
        path: ['code'],
      })
    }
  })

// totpCode: true | code: true, => true
// totpCode: false | code: false, 2FA: true  => true

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
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
})

export const LogoutBodySchema = z.object({
  refreshToken: z.string().max(1000),
})

export const VerificationCodeSchema = z
  .object({
    id: z.number(),
    email: z.email(),
    code: z.string().length(6),
    type: z.enum([
      VerificationCode.REGISTER,
      VerificationCode.FORGOT_PASSWORD,
      VerificationCode.LOGIN,
      VerificationCode.DISABLE_2FA,
    ]),
    expiresAt: z.iso.datetime(),
    createdAt: z.iso.datetime(),
  })
  .strict()

export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export const DeviceSchema = z
  .object({
    id: z.number(),
    userAgent: z.string(),
    ip: z.string(),
    lastActive: z.iso.datetime(),
    isActive: z.boolean(),
    userId: z.number().positive(),
    createdAt: z.iso.datetime(),
  })
  .strict()

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
    code: z.string().length(6),
    password: z.string().min(6).max(20),
    confirmPassword: z.string().min(6).max(20),
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

export const TwoFactorAuthResponseSchema = z
  .object({
    uri: z.string().url(),
    secret: z.string(),
  })
  .strict()

export const TwoFactorAuthStatusResponseSchema = z
  .object({
    message: z.string(),
    isEnabled: z.boolean(),
  })
  .strict()

export const DisableTwoFactorAuthBodySchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .superRefine(({ totpCode, code }, ctx) => {
    if (!totpCode && !code) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of totpCode or code must be provided',
        path: ['totpCode', 'code'],
      })
    }
  })

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

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
export type TwoFactorAuthResponseType = z.infer<typeof TwoFactorAuthResponseSchema>

export type TwoFactorAuthStatusResponseType = z.infer<typeof TwoFactorAuthStatusResponseSchema>
export type DisableTwoFactorAuthBodyType = z.infer<typeof DisableTwoFactorAuthBodySchema>
