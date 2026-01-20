import { ArgsType, Field, Float, InputType, Int, ObjectType, PickType } from '@nestjs/graphql'
import { UpsertSKUInput } from 'src/routes/product/graphql/sku.entity'
import { ORDER_BY, OrderByType, SORT_BY, SortByType } from 'src/shared/constants/other.constant'
import { BrandIncludeTranslation } from 'src/shared/graphql-entities/brand-translation.entity'
import { CategoryIncludeTranslation } from 'src/shared/graphql-entities/category-translation.entity'
import { Pagination } from 'src/shared/graphql-entities/pagination.entity'
import { ProductIncludeTranslation } from 'src/shared/graphql-entities/product-translation.entity'
import { Product, ProductVariantInput } from 'src/shared/graphql-entities/product.entity'
import { SKU } from 'src/shared/graphql-entities/sku.entity'

export class GetProductsQuery {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  page: number

  @Field(() => Int, { defaultValue: 10, nullable: true })
  limit: number

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [Int], { nullable: true })
  brandIds?: number[]

  @Field(() => [Int], { nullable: true })
  categories?: number[]

  @Field(() => Float, { nullable: true })
  minPrice?: number

  @Field(() => Float, { nullable: true })
  maxPrice?: number

  @Field(() => Int, { nullable: true })
  createdById?: number

  @Field({ defaultValue: ORDER_BY.Desc, nullable: true })
  orderBy: OrderByType

  @Field({ defaultValue: SORT_BY.CreateAt, nullable: true })
  sortBy: SortByType
}

@ArgsType()
export class GetManageProductsQuery extends GetProductsQuery {
  @Field({ nullable: true })
  isPublic: boolean

  @Field(() => Int)
  createdById: number
}

@ObjectType()
export class GetProducts extends Pagination {
  @Field(() => [ProductIncludeTranslation])
  data: ProductIncludeTranslation[]
}

@ObjectType()
export class GetProduct extends ProductIncludeTranslation {
  @Field(() => [SKU])
  skus: SKU[]

  @Field(() => [CategoryIncludeTranslation])
  categories: CategoryIncludeTranslation[]

  @Field(() => BrandIncludeTranslation)
  brand: BrandIncludeTranslation
}

@InputType()
export class CreateProductInput extends PickType(
  Product,
  ['publishedAt', 'name', 'basePrice', 'virtualPrice', 'brandId', 'images'],
  InputType,
) {
  @Field(() => [UpsertSKUInput])
  skus: UpsertSKUInput[]

  @Field(() => [Int])
  categories: number[]

  @Field(() => [ProductVariantInput])
  variants: ProductVariantInput[]
}
