export const RoleName = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  Seller: 'SELLER',
} as const

export type RoleName = (typeof RoleName)[keyof typeof RoleName]
