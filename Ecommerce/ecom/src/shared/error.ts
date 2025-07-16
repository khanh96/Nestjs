import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException('Record not found')

export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Invalid password',
    path: 'password',
  },
])
