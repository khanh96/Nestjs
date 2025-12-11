import { VariantsType } from 'src/routes/product/product.model'
import { ProductTranslationType } from 'src/shared/models/product-translation.model'

declare global {
  //   namespace PrismaJson {
  //     type Variants = VariantsType

  //   }
  type Variants = VariantsType
  type ProductTranslations = Pick<ProductTranslationType, 'id' | 'name' | 'description' | 'languageId'>
  type Receiver = {
    name: string
    phone: string
    address: string
  }
}

// This file must be a module.
export {}
