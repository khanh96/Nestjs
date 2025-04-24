import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { PostsService } from 'src/routes/posts/posts.service'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { Auth } from 'src/shared/decorators/auth.decorator'
// import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
// import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { Request } from 'express'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { TokenPayload } from 'src/shared/types/jwt.type'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.OR })
  // @UseGuards(AuthenticationGuard)
  // @UseGuards(AccessTokenGuard)
  // @UseGuards(APIKeyGuard)
  //@Auth([AuthType.Bearer])
  @Get()
  getPosts(@ActiveUser() tokenPayload: TokenPayload) {
    console.log('tokenPayload', tokenPayload)
    return this.postsService.getPosts()
  }

  @Get(':id')
  getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id)
  }

  @Post()
  createPost(@Body() body: { title: string; content: string }) {
    return this.postsService.createPost(body)
  }

  @Put(':id')
  updatePost(@Param('id') id: string, @Body() body: { title: string; content: string }) {
    return this.postsService.updatePost(id, body)
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id)
  }
}
