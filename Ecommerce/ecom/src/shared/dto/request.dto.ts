import { createZodDto } from 'nestjs-zod'
import { EmptyBodyRequestSchema, PaginationQuerySchema } from 'src/shared/models/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodyRequestSchema) {}

export class PaginationQueryType extends createZodDto(PaginationQuerySchema) {}

export class PaginationQueryDTO extends createZodDto(PaginationQuerySchema) {}
