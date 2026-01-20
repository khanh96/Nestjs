import { HTTPMethod } from 'src/shared/constants/role.constant'
import { z } from 'zod'

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  module: z.string().max(500),
  path: z.string(),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.PATCH,
    HTTPMethod.DELETE,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type PermissionType = z.infer<typeof PermissionSchema>
