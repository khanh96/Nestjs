import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
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
  ];

  getPosts() {
    return this.posts;
  }

  getPostById(id: string) {
    const posts = this.getPosts();
    return posts.find((post) => post.id === parseInt(id));
  }

  createPost(body: { title: string; content: string }) {
    const posts = this.getPosts();
    const newPost = {
      id: posts.length + 1,
      title: body.title,
      content: body.content,
    };
    posts.push(newPost);
    return newPost;
  }

  updatePost(id: string, body: { title: string; content: string }) {
    const posts = this.getPosts();
    const postIndex = posts.findIndex((post) => post.id === parseInt(id));
    console.log(posts);
    if (postIndex !== -1) {
      posts[postIndex] = { ...posts[postIndex], ...body };
      return posts[postIndex];
    }
    return null;
  }

  deletePost(id: string) {
    const posts = this.getPosts();
    const postIndex = posts.findIndex((post) => post.id === parseInt(id));
    if (postIndex !== -1) {
      posts.splice(postIndex, 1);
      return { message: 'Post deleted successfully' };
    }
    return null;
  }
}
