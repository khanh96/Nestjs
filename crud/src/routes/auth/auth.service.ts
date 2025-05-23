import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library'
import { LoginBodyDTO } from 'src/routes/auth/auth.dto'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'
import { TokenService } from 'src/shared/services/token/token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: { email: string; password: string; name: string }) {
    // Perform registration logic here

    // Hash password if needed
    // Save user to the database
    // Send confirmation email if needed

    // How to hash password
    // import { hash } from 'bcrypt'
    // import { HashingService } from 'src/shared/services/hashing/hashing.service';
    try {
      const hashedPassword = await this.hashingService.hash(body.password)
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      })
      console.log('result,', user)
      return {
        result: user,
        message: 'Register successfully',
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        // P2002: Unique constraint failed on the fields: (`email`)
        throw new ConflictException(
          {
            message: 'Email already exists',
          },
          {
            cause: error,
            description: 'Email already exists',
          },
        )
      }
      throw error
    }
  }

  async login(body: LoginBodyDTO) {
    // Perform login logic here
    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    })
    if (!user) {
      throw new UnauthorizedException(
        {
          message: 'Account does not exist',
        },
        {
          cause: new Error('Account does not exist'),
          description: 'Account does not exist',
        },
      )
    }
    // Check if password is correct
    const isPasswordValid = await this.hashingService.compare(body.password, user.password)

    if (!isPasswordValid) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          message: 'Invalid password',
        },
      ])
    }
    // Generate access token and refresh token
    const { accessToken, refreshToken } = await this.generateToken(user.id)
    return {
      accessToken,
      refreshToken,
    }
    // Send email if needed
  }

  async generateToken(userId: number) {
    // Generate access token and refresh token
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId: userId }),
      this.tokenService.signRefreshToken({ userId: userId }),
    ])
    // Save refresh token to database
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    // console.log('refreshToken', refreshToken)
    // console.log('decodedRefreshToken', decodedRefreshToken)
    await this.prismaService.refreshToken.create({
      data: {
        userId: userId,
        token: refreshToken,
        expiresAt: new Date(decodedRefreshToken.exp * 1000), // Thời điểm hết hạn của refresh token.
        // decodedRefreshToken.exp là epoch time, để chuyển thành DateTime đưa vào prisma thì phải * 1000.
      },
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Verify refresh token
      const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Check if refresh token exists in database
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refreshToken,
        },
      })

      // 3. Delete old refresh token
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })

      // Generate access token and refresh token
      return await this.generateToken(decodedRefreshToken.userId)
    } catch (error) {
      console.log(error)
      if (isNotFoundPrismaError(error)) {
        // P2025: Record to delete does not exist.
        throw new UnauthorizedException(
          {
            message: 'Refresh token has been revoked or does not exist',
          },
          {
            cause: error,
            description: 'Refresh token does not exist',
          },
        )
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Verify refresh token
      await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Check if refresh token exists in database
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refreshToken,
        },
      })

      // 3. Delete  refresh token
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })

      return {
        message: 'Logout successfully',
      }
    } catch (error) {
      console.log(error)
      if (isNotFoundPrismaError(error)) {
        // P2025: Record to delete does not exist.
        throw new UnauthorizedException(
          {
            message: 'Refresh token has been revoked or does not exist',
          },
          {
            cause: error,
            description: 'Refresh token does not exist',
          },
        )
      }
      throw new UnauthorizedException()
    }
  }
}
