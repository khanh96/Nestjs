export const REQUEST_USER_KEY = 'user'

export const AuthType = {
  Bearer: 'Bearer',
  APIKey: 'APIKey',
  None: 'None',
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
