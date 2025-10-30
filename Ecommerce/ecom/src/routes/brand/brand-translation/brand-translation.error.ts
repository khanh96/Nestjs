import { UnprocessableEntityException } from '@nestjs/common'

export const BrandTranslationAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'languageId || brandId',
    message: 'Error.BrandTranslationAlreadyExists',
  },
])

export const LanguageOrBrandNotFoundRecordException = new UnprocessableEntityException([
  {
    message: 'Error.LanguageNotFoundRecord',
    path: 'languageId || brandId',
  },
])
