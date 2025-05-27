import { createZodDto } from 'nestjs-zod'
import { EmptyBodyRequestSchema } from 'src/shared/models/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodyRequestSchema) {}
