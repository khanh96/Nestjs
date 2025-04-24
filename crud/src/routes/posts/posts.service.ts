import { Injectable } from '@nestjs/common'
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

  getPostById(id: string) {
    // const posts = this.getPosts()
    return this.prismaService.post.findUnique({ where: { id: parseInt(id) } })
    // return posts.find((post) => post.id === parseInt(id))
  }

  createPost(body: { title: string; content: string }, userId: number) {
    // const posts = this.getPosts()
    // const newPost = {
    //   id: posts.length + 1,
    //   title: body.title,
    //   content: body.content,
    // }
    // posts.push(newPost)
    return this.prismaService.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    })
    // return newPost
  }

  updatePost(id: string, body: { title: string; content: string }) {
    // const posts = this.getPosts()
    // const postIndex = posts.findIndex((post) => post.id === parseInt(id))
    // console.log(posts)
    // if (postIndex !== -1) {
    //   posts[postIndex] = { ...posts[postIndex], ...body }
    //   return posts[postIndex]
    // }
    return this.prismaService.post.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        content: body.content,
        authorId: 1,
      },
    })
    // return null
  }

  async deletePost(id: string) {
    // const posts = this.getPosts()
    // const postIndex = posts.findIndex((post) => post.id === parseInt(id))
    // if (postIndex !== -1) {
    //   posts.splice(postIndex, 1)
    //   return { message: 'Post deleted successfully' }
    // }
    // return null

    const result = await this.prismaService.post.delete({
      where: { id: parseInt(id) },
    })

    return { result: result, message: 'Post deleted successfully' }
  }
}
