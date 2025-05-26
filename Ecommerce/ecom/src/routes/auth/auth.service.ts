import { Injectable, UnauthorizedException } from '@nestjs/common'
import {
  ForgotPasswordBodyType,
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
import {
  AccountNotExistException,
  EmailAlreadyExistsException,
  InvalidOTPException,
  InvalidRefreshTokenException,
  OTPExpiredException,
  PasswordIncorrectException,
} from 'src/routes/auth/error.model'

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
        throw InvalidOTPException
      }
      if (otp.expiresAt < new Date()) {
        throw OTPExpiredException
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
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    //1. check if email exists in db
    const user = await this.userRepository.findUnique({ email: body.email })

    if (body.type === VerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }

    if (body.type === VerificationCode.FORGOT_PASSWORD && !user) {
      throw AccountNotExistException
    }

    //2. generate otp
    const otpCode = generateOTP()
    //3. save otp to database
    await this.authRepository.createVerificationCode({
      email: body.email,
      code: otpCode,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)), // Thời gian hiện tại tạo otp + 30s
      type: body.type,
    })
    //4. send otp to email using Resend
    //NOTE: Tạm thời đóng để tránh gửi email quá nhiều trong quá trình phát triển
    // const { data, error } = await this.emailService.sendEmailOtp({
    //   from: envConfig.EMAIL_FROM,
    //   to: body.email,
    //   subject: 'Send OTP code',
    //   content: otpCode,
    // })
    // console.log(data)
    // if (error) {
    //   throw SendOtpFailedException
    // }
    console.log(`send otp ${otpCode} from ${envConfig.EMAIL_FROM} to email: ${body.email}`)
    return {
      message: 'Send OTP successfully',
    }
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
    // refreshToken: { userId, expiresIn }
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
    // Verify refresh token
    const refreshTokenDecoded = await this.tokenService.verifyRefreshToken(refreshToken)
    if (!refreshTokenDecoded) {
      throw InvalidRefreshTokenException
    }
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
      throw AccountNotExistException
    }
    // 2. Check if password is correct
    const isPasswordValid = await this.hashingService.compare(password, user.password)

    if (!isPasswordValid) {
      throw PasswordIncorrectException
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

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, password } = body

    //1. Check if otp exists in the database
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email,
      code,
      type: VerificationCode.FORGOT_PASSWORD,
    })

    if (!verificationCode) {
      throw InvalidOTPException
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }

    //2. Check if user exists in the database
    const user = await this.userRepository.findUnique({ email })
    if (!user) {
      throw AccountNotExistException
    }
    //3. Hash new password
    const hashedPassword = await this.hashingService.hash(password)

    //4. Update user password
    await this.authRepository.updateUser(
      { id: user.id },
      {
        password: hashedPassword,
      },
    )

    //5. Delete verification code
    await this.authRepository.deleteVerificationCode({
      id: verificationCode.id,
    })

    return
  }
}
