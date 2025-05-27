import { z } from 'zod'

// Khởi tạo các model cho request body truyền lên là object rỗng {}
export const EmptyBodyRequestSchema = z.object({}).strict()

export type EmptyBodyRequestType = z.infer<typeof EmptyBodyRequestSchema>
