import { Injectable, UnauthorizedException } from '@nestjs/common'
import {
  DisableTwoFactorAuthBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOtpBodyType,
  VerificationCodeSchemaType,
} from 'src/routes/auth/auth.model'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import envConfig from 'src/shared/config'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { TokenService } from 'src/shared/services/token/token.service'
import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { ShareUserRepository } from 'src/shared/repositories/user.repo'
import { VerificationCode, VerificationCodeType } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/services/email/email.service'
import { RoleName } from 'src/shared/constants/role.constant'
import {
  AccountNotExistException,
  AlreadyEnabled2FAException,
  EmailAlreadyExistsException,
  InvalidOTPException,
  InvalidRefreshTokenException,
  InvalidTOTPException,
  NotEnabled2FAException,
  OTPExpiredException,
} from 'src/routes/auth/auth.error'
import { TwoFactorAuthService } from 'src/shared/services/2fa/2fa.service'
import { InvalidPasswordException } from 'src/shared/error'
import { ShareRoleRepository } from 'src/shared/repositories/role.repo'

/**
 * Sử dụng file .service để xử lý các nghiệp vụ
 */

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly shareRolesService: ShareRoleRepository,
    private readonly tokenService: TokenService,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly shareRoleRepository: ShareRoleRepository,
  ) {}

  private async verifyVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: VerificationCodeType
  }): Promise<VerificationCodeSchemaType> {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email: email,
      code: code,
      type: type,
    })

    if (!verificationCode) {
      throw InvalidOTPException
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }
    return verificationCode
  }

  async register(body: RegisterBodyType) {
    try {
      //1. verification code otp
      await this.verifyVerificationCode({ email: body.email, code: body.code, type: VerificationCode.REGISTER })

      const roleId = await this.shareRolesService.getClientRoleId()
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
    const user = await this.shareUserRepository.findUnique({ email: body.email })

    if (body.type === VerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }
    if (!user) {
      if (
        body.type === VerificationCode.FORGOT_PASSWORD ||
        body.type === VerificationCode.LOGIN ||
        body.type === VerificationCode.DISABLE_2FA
      ) {
        throw AccountNotExistException
      }
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
    const user = await this.shareUserRepository.findUserByEmailIncludeRole(email)

    if (!user) {
      throw AccountNotExistException
    }
    // 2. Check if password is correct
    const isPasswordValid = await this.hashingService.compare(password, user.password)

    if (!isPasswordValid) {
      throw InvalidPasswordException
    }

    // 3. If user has two-factor authentication enabled, verify the TOTP code or OTP code
    if (user.totpSecret) {
      if (body.totpCode) {
        // Verify the TOTP code
        const isValidTotp = this.twoFactorAuthService.verifyTOTP({
          email: user.email,
          token: body.totpCode,
          secret: user.totpSecret,
        })

        if (!isValidTotp) {
          throw InvalidTOTPException
        }
      } else if (body.code) {
        // Verify the OTP code
        await this.verifyVerificationCode({
          email: user.email,
          code: body.code,
          type: VerificationCode.LOGIN,
        })
      }
    }

    //4. Tạo record trong bảng Device để lưu thông tin deviceId
    const deviceId = await this.authRepository.createDevice({
      userAgent: body.userAgent,
      ip: body.ipAddress,
      userId: user.id,
    })

    //5. Generate tokens
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
    const verificationCode = await this.verifyVerificationCode({
      email,
      code,
      type: VerificationCode.FORGOT_PASSWORD,
    })

    //2. Check if user exists in the database
    const user = await this.shareUserRepository.findUnique({ email })
    if (!user) {
      throw AccountNotExistException
    }
    //3. Hash new password
    const hashedPassword = await this.hashingService.hash(password)

    //4. Update user password
    await this.shareUserRepository.update(
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

  async setupTwoFactorAuth(userId: number) {
    // 1. Check if user exists
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw AccountNotExistException
    }
    // 2. Check user enabled two-factor authentication
    if (user.totpSecret) {
      throw AlreadyEnabled2FAException
    }
    // 3. Generate two-factor authentication secret
    const { uri, secret } = this.twoFactorAuthService.generateTOTPSecret(user.email)

    // 4. Save two-factor authentication secret to the database
    await this.shareUserRepository.update(
      { id: userId },
      {
        totpSecret: secret,
      },
    )
    // 5. Return URI and totp for the user to scan with their authenticator app
    return {
      uri,
      secret,
    }
  }

  async getTwoFactorAuthStatus(userId: number) {
    // 1. Check if user exists
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw AccountNotExistException
    }
    // 2. Check user enabled two-factor authentication
    if (user.totpSecret) {
      return {
        message: 'Two-factor authentication is enabled',
        isEnabled: true,
      }
    }
    return {
      message: 'Two-factor authentication is not enabled',
      isEnabled: false,
    }
  }

  async disableTwoFactorAuth({ code, totpCode, userId }: DisableTwoFactorAuthBodyType & { userId: number }) {
    // 1. Check if user exists
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw AccountNotExistException
    }
    // 2. Check user enabled two-factor authentication
    if (!user.totpSecret) {
      throw NotEnabled2FAException
    }
    // 3. Verify the totp or code
    if (totpCode) {
      // Verify the TOTP code
      const isValidTotp = this.twoFactorAuthService.verifyTOTP({
        email: user.email,
        token: totpCode,
        secret: user.totpSecret,
      })

      if (!isValidTotp) {
        throw InvalidTOTPException
      }
    } else if (code) {
      await this.verifyVerificationCode({
        email: user.email,
        code,
        type: VerificationCode.DISABLE_2FA,
      })
    }

    // 4. Update user to disable two-factor authentication
    await this.shareUserRepository.update({ id: userId }, { totpSecret: null, updatedById: userId })
    return {
      message: 'Two-factor authentication has been disabled successfully',
    }
  }
}
