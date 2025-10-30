import { z } from 'zod'

// Khởi tạo các model cho request body truyền lên là object rỗng {}
export const EmptyBodyRequestSchema = z.object({}).strict()

export type EmptyBodyRequestType = z.infer<typeof EmptyBodyRequestSchema>

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
  limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
})
