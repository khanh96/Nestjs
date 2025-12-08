import path from 'path'

export const UPLOAD_DIR = path.resolve('upload')

export const ALL_LANGUAGES_CODE = 'all'

export const ORDER_BY = {
  Asc: 'asc',
  Desc: 'desc',
} as const

export const SORT_BY = {
  Price: 'price',
  CreateAt: 'createdAt',
  Sale: 'sale',
} as const

export type OrderByType = (typeof ORDER_BY)[keyof typeof ORDER_BY]

export type SortByType = (typeof SORT_BY)[keyof typeof SORT_BY]
