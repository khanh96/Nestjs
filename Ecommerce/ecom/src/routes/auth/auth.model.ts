import { UserStatus } from 'src/shared/constants/auth.constant'
import { z } from 'zod'

/**
 * Sử dụng file .modle để khởi tạo các model cho database
 * Đồng thời sử dụng để validate request body trước khi chạy vào controller
 * Viết riềng ra như này thì sau khi làm frontend có thể sử dụng lại
 */

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(20),
  phoneNumber: z.string().min(9).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
})
  .extend({
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

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type UserType = z.infer<typeof UserSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>
