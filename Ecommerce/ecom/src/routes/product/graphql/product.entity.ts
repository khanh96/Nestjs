import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Product {
  @Field()
  id: string

  @Field()
  name: string
}
