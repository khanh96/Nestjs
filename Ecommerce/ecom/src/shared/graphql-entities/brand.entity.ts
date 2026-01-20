import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Timestamp } from 'src/shared/graphql-entities/timestamp.entity'

@ObjectType()
export class Brand extends Timestamp {
  @Field(() => Int)
  id: number

  @Field(() => String)
  name: string

  @Field(() => String)
  logo: string
}
