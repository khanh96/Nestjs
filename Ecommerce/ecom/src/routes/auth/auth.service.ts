import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { access } from 'fs'
import { LoginBodyType, LogoutBodyType, RefreshTokenBodyType, RegisterBodyType } from 'src/routes/auth/auth.model'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { TokenService } from 'src/shared/services/token/token.service'

/**
 * Sử dụng file .service để xử lý các nghiệp vụ
 */

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const roleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const user = await this.authRepository.createUser({
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phoneNumber: body.phoneNumber,
        roleId: roleId,
      })

      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        console.log('error', error)
        // P2002: Unique constraint failed on the fields: (`email`)
        throw new ConflictException(
          {
            message: 'Email already exists',
            status: HttpStatus.CONFLICT,
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

  async generateTokens(payload: { userId: number }): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])
    const refreshTokenDecoded = await this.tokenService.verifyRefreshToken(refreshToken)
    if (!refreshTokenDecoded) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
      })
    }
    // Store refresh token in the database
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + refreshTokenDecoded.exp * 1000),
      deviceId: 3, // TODO: Chua cos deviceId
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async login(body: LoginBodyType): Promise<{
    accessToken: string
    refreshToken: string
    role: string
  }> {
    const email = body.email
    const password = body.password
    // 1. Check if user exists

    const user = await this.authRepository.findUserByEmail(email)

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
    // 2. Check if password is correct
    const isPasswordValid = await this.hashingService.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          message: 'Password is incorrect',
        },
      ])
    }
    //3. Generate tokens
    const tokens = await this.generateTokens({ userId: user.id })
    return {
      role: user.role.name,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  async logout(body: LogoutBodyType): Promise<{
    message: string
  }> {
    try {
      //1. Check if refreshToken is valid
      await this.tokenService.verifyRefreshToken(body.refreshToken)
      //2. Check if refresh token is in the database
      const refreshToken = await this.authRepository.findRefreshTokenExist(body.refreshToken)
      //3. Delete refresh token
      await this.authRepository.deleteRefreshToken(refreshToken.token)

      //4. Return success message
      return {
        message: 'Logout successfully',
      }
    } catch (error) {
      console.log('error=====', error)
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

  async refreshToken(body: RefreshTokenBodyType): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    try {
      //1. Check if refresh token is valid
      const { userId } = await this.tokenService.verifyRefreshToken(body.refreshToken)
      //2. Check if refresh token is in the database
      const refreshToken = await this.authRepository.findRefreshTokenExist(body.refreshToken)
      //3. Delete old refresh token
      await this.authRepository.deleteRefreshToken(refreshToken.token)
      //4. Generate new access token and refresh token
      const tokens = await this.generateTokens({ userId: userId })

      //6. Return new access token and refresh token
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    } catch (error) {
      console.log('error', error)
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

  forgotPassword() {
    return 'Forgot password route'
  }
}
