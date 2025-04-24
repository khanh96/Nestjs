import { Exclude } from 'class-transformer'

export class PostModel {
  id: number
  title: string
  content: string
  @Exclude()
  authorId: number
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<PostModel>) {
    Object.assign(this, partial)
  }
}
