import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductTranslationModule } from './product-translation/product-translation.module'
import { ProductRepo } from 'src/routes/product/product.repo'
import { ManageProductController } from 'src/routes/product/manage-product.controller'
import { ManageProductService } from 'src/routes/product/manage-product.service'
// import { ManageProductResolver } from 'src/routes/product/graphql/manage-product.resolver'
import { ProductResolver } from 'src/routes/product/graphql/product.resolver'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepo, ManageProductService, ProductResolver],
  imports: [ProductTranslationModule],
})
export class ProductModule {}
