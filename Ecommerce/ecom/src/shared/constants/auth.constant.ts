export const REQUEST_USER_KEY = 'user'
export const REQUEST_ROLE_PERMISSIONS_KEY = 'role_permissions'

export const AuthType = {
  Bearer: 'Bearer',
  APIKey: 'APIKey',
  None: 'None',
  PaymentAPIKey: 'PaymentAPIKey',
} as const

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType]

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[]
  options: {
    condition: ConditionGuardType
  }
}

export const ConditionGuard = {
  AND: 'AND',
  OR: 'OR',
} as const

export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export const VerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  LOGIN: 'LOGIN',
  DISABLE_2FA: 'DISABLE_2FA',
} as const

export type VerificationCodeType = (typeof VerificationCode)[keyof typeof VerificationCode]
