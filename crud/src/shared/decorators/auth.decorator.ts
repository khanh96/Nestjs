import { SetMetadata } from '@nestjs/common'
import { AuthTypeType, ConditionGuardType } from 'src/shared/constants/auth.constant'

export const AUTH_TYPE_KEY = 'authType'

//@Auth([AuthType.Bearer, AuthType.APIKey],{ condition: ConditionGuard.AND })
export const Auth = (authTypes: AuthTypeType[], options: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options })
}
