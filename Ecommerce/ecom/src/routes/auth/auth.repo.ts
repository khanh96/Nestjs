import { Injectable } from '@nestjs/common'
import { DeviceType, RefreshTokenType, RegisterBodyType, VerificationCodeSchemaType } from 'src/routes/auth/auth.model'
import { VerificationCodeType } from 'src/shared/constants/auth.constant'
import { SerializeAll } from 'src/shared/decorators/serialize.decorator'
import { RoleType } from 'src/shared/models/role.model'
import { UserType } from 'src/shared/models/user.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

/**
 * Sử dụng file .repo để xử lý các truy vấn đến database
 * Tác riêng logic truy vấn dữ liệu vào truy vấn nghiệp vụ
 * Phần này sẽ xử lý các truy vấn đến database
 */

// User Model
type CreateUserType = Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>

type ResUserType = Omit<UserType, 'password' | 'totpSecret'>

// Refresh Token Model
type CreateRefreshTokenType = Omit<RefreshTokenType, 'id' | 'createdAt'>

@Injectable()
@SerializeAll()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: CreateUserType): Promise<ResUserType> {
    // fake data response from DB
    // return await new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     try {
    //       resolve({
    //         id: 1,
    //         avatar: 'aaaa',
    //         status: 'INACTIVE',
    //         createdById: 1,
    //         email: 'email@gmail.com',
    //         name: 'lucian',
    //         phoneNumber: '123123123',
    //         roleId: 1,
    //         updatedById: 1,
    //         deletedById: 1,
    //         deletedAt: null,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //       })
    //     } catch (error) {
    //       reject(error instanceof Error ? error : new Error(String(error)))
    //     }
    //   }, 2000)
    // })
    return (await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })) as any
  }

  async createUserIncludeRole(
    user: Pick<UserType, 'name' | 'avatar' | 'email' | 'password' | 'phoneNumber' | 'roleId'>,
  ): Promise<
    UserType & {
      role: RoleType
    }
  > {
    return (await this.prismaService.user.create({
      data: user,
      include: {
        role: true,
      },
    })) as any
  }

  async createVerificationCode(
    payload: Pick<VerificationCodeSchemaType, 'email' | 'code' | 'expiresAt' | 'type'>,
  ): Promise<VerificationCodeSchemaType> {
    return (await this.prismaService.verificationCode.upsert({
      where: {
        email_code_type: {
          email: payload.email,
          code: payload.code,
          type: payload.type,
        },
      },
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
        type: payload.type,
      },
      create: payload,
    })) as any
  }

  async findUniqueVerificationCode(
    uniqueObject: { id: number } | { email: string; code: string; type: VerificationCodeType },
  ) {
    return (await this.prismaService.verificationCode.findUnique({
      where: {
        id: 'id' in uniqueObject ? uniqueObject.id : undefined,
        email_code_type:
          'email' in uniqueObject
            ? { email: uniqueObject.email, code: uniqueObject.code, type: uniqueObject.type }
            : undefined,
      },
    })) as any
  }

  async deleteVerificationCode(
    where: Pick<VerificationCodeSchemaType, 'id'> | Pick<VerificationCodeSchemaType, 'code' | 'email' | 'type'>,
  ): Promise<VerificationCodeSchemaType> {
    return (await this.prismaService.verificationCode.delete({
      where: {
        id: 'id' in where ? where.id : undefined,
        email_code_type: 'email' in where ? { email: where.email, code: where.code, type: where.type } : undefined,
      },
    })) as any
  }

  async createDevice(
    payload: Pick<DeviceType, 'userAgent' | 'ip' | 'userId'> & Partial<Pick<DeviceType, 'isActive' | 'lastActive'>>,
  ): Promise<DeviceType> {
    return (await this.prismaService.device.create({
      data: payload,
    })) as any
  }

  async updateDevice(deviceId: number, payload: Partial<DeviceType>): Promise<DeviceType> {
    return (await this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data: payload,
    })) as any
  }

  async createRefreshToken(payload: {
    expiresAt: Date
    userId: number
    token: string
    deviceId: number
  }): Promise<RefreshTokenType> {
    return (await this.prismaService.refreshToken.create({
      data: payload,
    })) as any
  }

  async findUniqueRefreshTokenIncludeUserRole(
    refreshToken: string,
  ): Promise<RefreshTokenType & { user: UserType & { role: RoleType } }> {
    return (await this.prismaService.refreshToken.findUniqueOrThrow({
      where: {
        token: refreshToken,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    })) as any
  }

  async deleteRefreshToken(refreshToken: string): Promise<RefreshTokenType> {
    return (await this.prismaService.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    })) as any
  }
}
