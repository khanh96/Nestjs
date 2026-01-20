import { Field, Float, InputType, Int, ObjectType, PickType } from '@nestjs/graphql'
import { Timestamp } from 'src/shared/graphql-entities/timestamp.entity'

@ObjectType()
export class ProductVariant {
  @Field()
  value: string

  @Field(() => [String])
  options: string[]
}

@InputType()
export class ProductVariantInput extends PickType(ProductVariant, ['value', 'options'], InputType) {}

@ObjectType()
export class Product extends Timestamp {
  @Field(() => Int)
  id: number

  @Field(() => Date, { nullable: true })
  publishedAt: Date | null

  @Field()
  name: string

  @Field(() => Float)
  basePrice: number

  @Field(() => Float)
  virtualPrice: number

  @Field(() => Int)
  brandId: number

  @Field(() => [String])
  images: string[]

  @Field(() => [ProductVariant])
  variants: ProductVariant[]
}
