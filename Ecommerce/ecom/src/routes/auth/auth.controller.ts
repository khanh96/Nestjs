import { Body, Controller, Get, Ip, Post, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  DisableTwoFactorAuthBodyDto,
  ForgotPasswordBodyDto,
  LoginBodyDto,
  LoginResponseDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResponseDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
  TwoFactorAuthResponseDto,
  TwoFactorAuthStatusResponseDto,
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { GoogleService } from 'src/routes/auth/google.service'
import envConfig from 'src/shared/config'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResponseDto } from 'src/shared/dto/response.dto'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @IsPublic()
  @Post('register')
  @ZodSerializerDto(RegisterResponseDto) // decorator này sử dụng để  serialize the response using Zod
  @MessageRes('Register successfully')
  async register(@Body() body: RegisterBodyDto) {
    const result = await this.authService.register(body)
    return result
  }

  @IsPublic()
  @MessageRes('Send OTP successfully')
  @Post('send-otp')
  @ZodSerializerDto(MessageResponseDto)
  sendOtp(@Body() body: SendOtpBodyDto) {
    const result = this.authService.sendOtp(body)
    return result
  }

  @IsPublic()
  @MessageRes('Login successfully')
  @ZodSerializerDto(LoginResponseDto)
  @Post('login')
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ipAddress: string) {
    const result = await this.authService.login({
      ...body,
      userAgent,
      ipAddress,
    })
    return result
  }

  @MessageRes('Logout successfully')
  @Post('logout')
  @ZodSerializerDto(MessageResponseDto)
  async logout(@Body() body: LogoutBodyDto) {
    const result = await this.authService.logout(body)
    return result
  }

  @MessageRes('Refresh token successfully')
  @ZodSerializerDto(RefreshTokenResponseDto)
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenBodyDto, @UserAgent() userAgent: string, @Ip() ipAddress: string) {
    const result = await this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ipAddress,
    })
    return result
  }

  @MessageRes('Get Google link successfully')
  @Get('google-link')
  @IsPublic()
  getGoogleLink(@UserAgent() userAgent: string, @Ip() ipAddress: string) {
    const result = this.googleService.getGoogleLink(userAgent, ipAddress)
    return result
  }

  @MessageRes('Google callback successfully')
  @IsPublic()
  @Get('google/callback')
  async googleCallback(@Query() query: { code: string; state: string }, @Res() res: Response) {
    const { code, state } = query

    try {
      const result = await this.googleService.googleCallback({ code, state })

      const url = new URL(envConfig.GOOGLE_CLIENT_OAUTH_URL)
      url.searchParams.set('accessToken', result.accessToken)
      url.searchParams.set('refreshToken', result.refreshToken)
      // Redirect to the client application with tokens
      // console.log('URL=>', url.href)
      return res.redirect(url.href)
    } catch (error) {
      console.error('Error during Google callback:', error)
      const message = error instanceof Error ? error.message : 'Something went wrong with Google authentication'
      const url = new URL(envConfig.GOOGLE_CLIENT_OAUTH_URL)
      url.searchParams.set('errorMessage', message)
      return res.redirect(url.href)
    }
  }

  @IsPublic()
  @MessageRes('Forgot password successfully')
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordBodyDto) {
    const result = await this.authService.forgotPassword(body)
    return result
  }

  // Tại sao không dùng GET mà dùng POST? khi mà body gửi lên là {}
  // Vì POST mang ý nghĩa là tạo ra cái gì đó và POST cũng bảo mật hơn GET
  // Vì GET có thể được kích hoạt thông qua URL trên trình duyệt, POST thì không
  @MessageRes('Setup 2FA successfully')
  @ZodSerializerDto(TwoFactorAuthResponseDto)
  @Post('2fa/setup')
  async setupTwoFactorAuth(@ActiveUser() activeUser: AccessTokenPayload) {
    const { userId } = activeUser
    const result = await this.authService.setupTwoFactorAuth(userId)
    return result
  }

  @ZodSerializerDto(TwoFactorAuthStatusResponseDto)
  @Get('2fa/status')
  async getTwoFactorAuthStatus(@ActiveUser() activeUser: AccessTokenPayload) {
    const { userId } = activeUser
    const result = await this.authService.getTwoFactorAuthStatus(userId)
    return result
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResponseDto)
  disableTwoFactorAuth(@Body() body: DisableTwoFactorAuthBodyDto, @ActiveUser() activeUser: AccessTokenPayload) {
    const { userId } = activeUser
    const { code, totpCode } = body
    const result = this.authService.disableTwoFactorAuth({ userId, code, totpCode })
    return result
  }
}
