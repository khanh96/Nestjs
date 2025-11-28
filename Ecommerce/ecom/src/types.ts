import { VariantsType } from 'src/routes/product/product.model'

declare global {
  //   namespace PrismaJson {
  //     type Variants = VariantsType

  //   }
  type Variants = VariantsType
}

// This file must be a module.
export {}
