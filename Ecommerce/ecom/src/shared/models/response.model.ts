import { z } from 'zod'

export const MessageResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict()

export type MessageResponseType = z.infer<typeof MessageResponseSchema>
