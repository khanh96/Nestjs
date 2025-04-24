import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { PostsService } from 'src/routes/posts/posts.service'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { Auth } from 'src/shared/decorators/auth.decorator'
// import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
// import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { Request } from 'express'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { TokenPayload } from 'src/shared/types/jwt.type'
import { CreatePostBodyDTO, GetPostItemResponseDTO, UpdatePostBodyDTO } from 'src/routes/posts/post.dto'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.OR })
  // @UseGuards(AuthenticationGuard)
  // @UseGuards(AccessTokenGuard)
  // @UseGuards(APIKeyGuard)
  //@Auth([AuthType.Bearer])
  @Get()
  async getPosts(@ActiveUser() tokenPayload: TokenPayload): Promise<GetPostItemResponseDTO[]> {
    const { userId } = tokenPayload
    const result = await this.postsService.getPosts(userId)
    const response = result.map((item) => new GetPostItemResponseDTO(item))
    return response
  }

  @Get(':id')
  async getPostById(@Param('id') id: number) {
    const result = await this.postsService.getPostById(Number(id))
    return new GetPostItemResponseDTO(result)
  }

  @Auth([AuthType.Bearer])
  @Post()
  async createPost(
    @Body() body: CreatePostBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<GetPostItemResponseDTO> {
    const result = await this.postsService.createPost(body, userId)
    return new GetPostItemResponseDTO(result)
  }

  @Auth([AuthType.Bearer])
  @Put(':id')
  async updatePost(@Param('id') id: number, @Body() body: UpdatePostBodyDTO, @ActiveUser('userId') userId: number) {
    const result = await this.postsService.updatePost({
      postId: id,
      body,
      userId,
    })
    return new GetPostItemResponseDTO(result)
  }

  @Auth([AuthType.Bearer])
  @Delete(':id')
  deletePost(@Param('id') id: number, @ActiveUser('userId') userId: number) {
    return this.postsService.deletePost(id, userId)
  }
}
