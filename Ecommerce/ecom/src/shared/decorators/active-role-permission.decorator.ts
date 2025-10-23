import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { REQUEST_ROLE_PERMISSIONS_KEY } from 'src/shared/constants/auth.constant'
import { RolePermissionsType } from 'src/shared/models/role.model'

export const ActiveRolePermissions = createParamDecorator(
  (field: keyof RolePermissionsType | undefined, context: ExecutionContext) => {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const rolePermissions: RolePermissionsType = request[REQUEST_ROLE_PERMISSIONS_KEY]
    return field ? rolePermissions?.[field] : rolePermissions
  },
)
