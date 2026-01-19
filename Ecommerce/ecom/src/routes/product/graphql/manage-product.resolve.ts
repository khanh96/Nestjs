import { UseGuards } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'
import { Product } from 'src/routes/product/graphql/product.entity'
import { GqlThrottlerGuard } from 'src/shared/guards/gql-throttler.guard'

@Resolver()
@UseGuards(GqlThrottlerGuard)
export class ManageProductResolver {
  @Query(() => [Product], { name: 'findAll' })
  findAll() {
    const result = [
      { id: '1', name: 'Product 1' },
      { id: '2', name: 'Product 2' },
    ]
    console.log('Returning:', result)
    return result
  }
}
