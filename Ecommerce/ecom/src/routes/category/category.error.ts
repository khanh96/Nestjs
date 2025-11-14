import { UnprocessableEntityException } from '@nestjs/common'

export const DeleteParentCategoryException = new UnprocessableEntityException([
  {
    message: 'Error.DeleteParentCategory',
  },
])
