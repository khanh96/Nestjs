import { Type } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { PostModel } from 'src/shared/models/post.model'
import { UserModel } from 'src/shared/models/user.model'

export class GetPostItemResponseDTO extends PostModel {
  @Type(() => UserModel)
  author: Omit<UserModel, 'password'>

  constructor(partial: Partial<GetPostItemResponseDTO>) {
    super(partial)
    Object.assign(this, partial)
  }
}

export class CreatePostBodyDTO {
  @IsNotEmpty()
  @IsString()
  title: string
  @IsString()
  @IsNotEmpty()
  content: string

  constructor(partial: Partial<CreatePostBodyDTO>) {
    Object.assign(this, partial)
  }
}

export class UpdatePostBodyDTO extends CreatePostBodyDTO {}
