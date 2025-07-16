import { createZodDto } from 'nestjs-zod'

import { ChangePasswordBodySchema, UpdateProfileBodySchema } from 'src/routes/profile/profile.model'

export class UpdateProfileBodyDto extends createZodDto(UpdateProfileBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
