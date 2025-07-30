import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionBodySchema,
  GetPermissionResponseSchema,
  GetPermissionsDetailResSchema,
  GetPermissionsParamsSchema,
  GetPermissionsQuerySchema,
  UpdatePermissionBodySchema,
} from 'src/routes/permission/permission.model'

export class GetPermissionsResDTO extends createZodDto(GetPermissionResponseSchema) {}
export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
export class GetPermissionsParamsDTO extends createZodDto(GetPermissionsParamsSchema) {}
export class GetPermissionsDetailResDTO extends createZodDto(GetPermissionsDetailResSchema) {}
export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}
