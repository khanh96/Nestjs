import { z } from 'zod'

export const LanguageSchema = z
  .object({
    id: z.string().min(2).max(10),
    name: z.string().min(1).max(50),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict()

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict()

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
}).strict()

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(10),
  })
  .strict()

export const GetLanguagesResponseSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguageDetailResponseSchema = LanguageSchema

export type LanguageType = z.infer<typeof LanguageSchema>
export type GetLanguagesResType = z.infer<typeof GetLanguagesResponseSchema>
export type GetLanguageDetailResType = z.infer<typeof GetLanguageDetailResponseSchema>
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>
