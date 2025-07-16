import { UserSchema } from 'src/shared/models/user.model'
import { z } from 'zod'

export const UpdateProfileBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).strict()

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true,
})
  .extend({
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword, password }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password and confirm new password do not match',
        path: ['confirmNewPassword'],
      })
    }
    if (newPassword === password) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password must be different from the old password',
        path: ['newPassword'],
      })
    }
  })

export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
