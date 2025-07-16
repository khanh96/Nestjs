export const RoleName = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  Seller: 'SELLER',
} as const

export type RoleName = (typeof RoleName)[keyof typeof RoleName]

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const
