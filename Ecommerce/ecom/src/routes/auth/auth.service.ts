import {
  BadGatewayException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import {
  LoginBodyType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOtpBodyType,
} from 'src/routes/auth/auth.model'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import envConfig from 'src/shared/config'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { TokenService } from 'src/shared/services/token/token.service'
import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { UserRepository } from 'src/shared/repositories/user.repo'
import { VerificationCode } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/services/email/email.service'
import { RoleName } from 'src/shared/constants/role.constant'

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
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      //1. verification code otp
      const otp = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: VerificationCode.REGISTER,
      })

      if (!otp) {
        throw new UnprocessableEntityException(
          [
            {
              message: 'Invalid OTP code',
              path: 'code',
            },
          ],
          {
            cause: new Error('Invalid OTP code'),
            description: 'Invalid OTP code',
          },
        )
      }
      if (otp.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'OTP code has expired',
            path: 'code',
          },
        ])
      }

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
        throw new UnprocessableEntityException(
          [
            {
              message: 'Email already exists',
              status: HttpStatus.UNPROCESSABLE_ENTITY,
            },
          ],
          {
            cause: error,
            description: 'Email already exists',
          },
        )
      }
      throw error
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    //1. check if email exists in db
    const user = await this.userRepository.findUnique({ email: body.email })
    if (user) {
      throw new UnprocessableEntityException(
        [
          {
            message: 'Email already exists',
            path: 'email',
          },
        ],
        {
          cause: new Error('Email already exists'),
          description: 'Email already exists',
        },
      )
    }
    //2. generate otp
    const otpCode = generateOTP()
    //3. save otp to database
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code: otpCode,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)), // Thời gian hiện tại tạo otp + 30s
      type: body.type,
    })
    //4. send otp to email using Resend
    const { data, error } = await this.emailService.sendEmailOtp({
      from: envConfig.EMAIL_FROM,
      to: body.email,
      subject: 'Send OTP code',
      content: otpCode,
    })
    console.log(data)
    console.log(`send otp ${otpCode} from ${envConfig.EMAIL_FROM} to email: ${body.email}`)
    if (error) {
      throw new BadGatewayException(
        {
          message: 'Send OTP failed',
          status: HttpStatus.BAD_GATEWAY,
        },
        { cause: error, description: 'Send OTP failed' },
      )
    }
    return verificationCode
  }

  async generateTokens(payload: {
    userId: number
    deviceId: number
    roleId: number
    roleName: RoleName
    expiresIn?: number
  }): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    // Generate access token and refresh token
    // accessToken: { userId, deviceId, roleId, roleName }
    // refreshToken: { userId }
    console.log('payload.expiresIn', payload.expiresIn)
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: payload.userId,
        deviceId: payload.deviceId,
        roleId: payload.roleId,
        roleName: payload.roleName,
      }),
      this.tokenService.signRefreshToken({
        userId: payload.userId,
        expiresIn: payload.expiresIn,
      }),
    ])
    // console.log('refreshToken', refreshToken)
    // Verify refresh token
    const refreshTokenDecoded = await this.tokenService.verifyRefreshToken(refreshToken)
    if (!refreshTokenDecoded) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
      })
    }
    // TODO: Hỏi tại sao thời gian hết hạn của 2 token lại khác nhau
    console.log('exp refresh-token', refreshTokenDecoded.exp)
    // Store refresh token in the database
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(refreshTokenDecoded.exp * 1000),
      deviceId: payload.deviceId,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async login(body: LoginBodyType & { userAgent: string; ipAddress: string }) {
    const email = body.email
    const password = body.password
    // 1. Check if user exists
    const user = await this.userRepository.findUserByEmailIncludeRole(email)

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
          path: 'password',
          message: 'Password is incorrect',
        },
      ])
    }

    //3. Tạo record trong bảng Device để lưu thông tin deviceId
    const deviceId = await this.authRepository.createDevice({
      userAgent: body.userAgent,
      ip: body.ipAddress,
      userId: user.id,
    })

    //4. Generate tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: deviceId.id,
      roleId: user.roleId,
      roleName: user.role.name as RoleName,
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  async logout(body: LogoutBodyType): Promise<{
    message: string
  }> {
    try {
      // 1. Check if refreshToken is valid
      await this.tokenService.verifyRefreshToken(body.refreshToken)
      // 2. Delete refresh token
      const refreshToken = await this.authRepository.deleteRefreshToken(body.refreshToken)
      // 3.  Update device
      await this.authRepository.updateDevice(refreshToken.deviceId, {
        isActive: false,
      })
      // 4. Return success message
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

  async refreshToken(body: RefreshTokenBodyType & { userAgent: string; ipAddress: string }): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    try {
      //1. Check if refresh token is valid
      const { userId, exp } = await this.tokenService.verifyRefreshToken(body.refreshToken)
      //2. Check if refresh token is in the database
      const refreshToken = await this.authRepository.findUniqueRefreshTokenIncludeUserRole(body.refreshToken)

      // 3. Update device
      const $device = this.authRepository.updateDevice(refreshToken.deviceId, {
        userAgent: body.userAgent,
        ip: body.ipAddress,
      })

      //4. Delete old refresh token
      const $refreshToken = this.authRepository.deleteRefreshToken(refreshToken.token)
      console.log(' exp trước đó', exp)
      //5. Generate new access token and refresh token
      const $tokens = this.generateTokens({
        userId: userId,
        roleId: refreshToken.user.roleId,
        roleName: refreshToken.user.role.name as RoleName,
        deviceId: refreshToken.deviceId,
        expiresIn: exp,
      })

      const [, , tokens] = await Promise.all([$device, $refreshToken, $tokens])

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
