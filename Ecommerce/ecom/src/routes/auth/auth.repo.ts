import { Injectable } from '@nestjs/common'
import { RegisterBodyType, UserType } from 'src/routes/auth/auth.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

/**
 * Sử dụng file .repo để xử lý các truy vấn đến database
 * Tác riêng logic truy vấn dữ liệu vào truy vấn nghiệp vụ
 * Phần này sẽ xử lý các truy vấn đến database
 */
type CreateUserType = Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>

type ResUserType = Omit<UserType, 'password' | 'totpSecret'>

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: CreateUserType): Promise<ResUserType> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }
}
