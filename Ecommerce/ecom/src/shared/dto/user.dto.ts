import { createZodDto } from 'nestjs-zod'
import { GetUserProfileResSchema, UpdateProfileResSchema } from 'src/shared/models/user.model'

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export class GetUserProfileResDto extends createZodDto(GetUserProfileResSchema) {}

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export class UpdateProfileResDto extends createZodDto(UpdateProfileResSchema) {}
