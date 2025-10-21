import { z } from 'zod'
import { PermissionSchema } from 'src/shared/models/permission.model'

export const GetPermissionResponseSchema = z.object({
  data: z.array(PermissionSchema),
  totalItems: z.number(), // total number of permissions
  page: z.number(), // current page number
  limit: z.number(), // number of items per page
  totalPages: z.number(), // total number of pages
})

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
    limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
  })
  .strict()

// Phục vụ cho việc lấy thông tin của một permission cụ thể như get detail, update, delete
export const GetPermissionsParamsSchema = z
  .object({
    permissionId: z.coerce.number(), // Phải thêm coerce để chuyển từ string sang number
  })
  .strict()

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  module: true,
}).strict()

export const GetPermissionsDetailResSchema = PermissionSchema

export const UpdatePermissionBodySchema = CreatePermissionBodySchema

export type PermissionType = z.infer<typeof PermissionSchema>
export type GetPermissionResponseType = z.infer<typeof GetPermissionResponseSchema>
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>
export type GetPermissionsParamsType = z.infer<typeof GetPermissionsParamsSchema>
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
export type GetPermissionsDetailResType = z.infer<typeof GetPermissionsDetailResSchema>
