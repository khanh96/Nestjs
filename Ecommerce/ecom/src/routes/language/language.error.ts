import { ConflictException } from '@nestjs/common'

export const LanguageAlreadyExistsException = (id: string) =>
  new ConflictException({
    message: `Language with ID ${id} already exists.`,
  })

export const LanguageNotFoundException = new ConflictException({
  message: 'Language not found.',
})
