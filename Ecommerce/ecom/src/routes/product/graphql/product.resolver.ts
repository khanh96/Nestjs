import { UseGuards } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { GetProducts, GetProductsQuery } from 'src/routes/product/graphql/product.entity'
import { ProductService } from 'src/routes/product/product.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { GqlThrottlerGuard } from 'src/shared/guards/gql-throttler.guard'

@Resolver()
@UseGuards(GqlThrottlerGuard)
@IsPublic()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [GetProducts], { name: 'products' })
  findAll(@Args() args: GetProductsQuery) {
    console.log('AAA')
    return this.productService.list({
      query: args,
    })
  }
  @Query(() => String)
  test(): string {
    return 'test'
  }

  // @Query(() => GetProducts, { name: 'product' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.productService.getDetail({
  //     productId: id,
  //   })
  // }
}
