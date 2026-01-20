import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Timestamp {
  @Field(() => Int)
  createdById: string

  @Field(() => Int, { nullable: true })
  updatedById?: number | null

  @Field(() => Int, { nullable: true })
  deletedById?: number | null

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
