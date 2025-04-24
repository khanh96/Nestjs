import { Injectable, NotFoundException } from '@nestjs/common'
import { CreatePostBodyDTO } from 'src/routes/posts/post.dto'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {
    this.prismaService = prismaService
  }

  private posts = [
    {
      id: 1,
      title: 'Post 1',
      content: 'Content of Post 1',
    },
    {
      id: 2,
      title: 'Post 2',
      content: 'Content of Post 2',
    },
  ]

  getPosts(userId: number) {
    return this.prismaService.post.findMany({
      where: {
        authorId: userId,
      },
      // include này như kiểu join trong SQL
      // lấy thêm thông tin của author
      // omit là loại bỏ các trường không cần thiết
      include: {
        author: {
          omit: {
            password: true,
          },
        },
      },
    })
  }

  async getPostById(id: number) {
    try {
      const result = await this.prismaService.post.findUniqueOrThrow({
        where: { id: id },
        include: {
          author: {
            omit: {
              password: true,
            },
          },
        },
      })
      return result
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException(`Post with id ${id} not found`, {
          cause: error,
        })
      }
      throw error
    }
  }

  async createPost(body: CreatePostBodyDTO, userId: number) {
    const result = await this.prismaService.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
      },
    })
    return result
  }

  async updatePost({ postId, body, userId }: { postId: number; body: CreatePostBodyDTO; userId: number }) {
    console.log('updatePost', { postId, body, userId })
    try {
      const result = await this.prismaService.post.update({
        where: { id: postId, authorId: userId },
        data: {
          title: body.title,
          content: body.content,
          authorId: userId,
        },
        include: {
          author: {
            omit: {
              password: true,
            },
          },
        },
      })
      return result
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException(`Post with id ${postId} not found`, {
          cause: error,
        })
      }
      throw error
    }
  }

  async deletePost(id: number, userId: number) {
    try {
      const result = await this.prismaService.post.delete({
        where: { id: id, authorId: userId },
      })

      return { result: result, message: 'Post deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException(`Post with id ${id} not found`, {
          cause: error,
        })
      }
      throw error
    }
  }
}
