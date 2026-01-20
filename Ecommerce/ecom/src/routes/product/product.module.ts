import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductTranslationModule } from './product-translation/product-translation.module'
import { ProductRepo } from 'src/routes/product/product.repo'

// ERROR: Lỗi khi mở field dưới sẽ không chạy được project dẫn đến không gọi được API ở postman còn đóng lại thì vẫn bình thường
// Error:connect ECONNREFUSED 127.0.0.1:3000

import { ManageProductController } from 'src/routes/product/manage-product.controller'
import { ManageProductService } from 'src/routes/product/manage-product.service'
// import { ManageProductResolver } from 'src/routes/product/graphql/manage-product.resolver'
// import { ProductResolver } from 'src/routes/product/graphql/product.resolver'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepo, ManageProductService],
  imports: [ProductTranslationModule],
})
export class ProductModule {}
