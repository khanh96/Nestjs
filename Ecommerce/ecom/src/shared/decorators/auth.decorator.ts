import { SetMetadata } from '@nestjs/common'
import { AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from 'src/shared/constants/auth.constant'

export const AUTH_TYPE_KEY = 'authType'

// SetMetadata - gắn metadata vào route/controller
// AUTH_TYPE_KEY - key để Guards sau này đọc metadata
// authTypes - mảng các loại authentication cần kiểm tra
// condition - điều kiện AND/OR khi có nhiều auth types
//@Auth([AuthType.Bearer, AuthType.APIKey],{ condition: ConditionGuard.AND })
export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: { condition: options?.condition ?? ConditionGuard.AND } })
}

//
export const IsPublic = () => {
  return Auth([AuthType.None])
}
