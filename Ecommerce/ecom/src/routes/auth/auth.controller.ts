import { Body, Controller, Ip, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  LoginBodyDto,
  LoginResponseDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto) // decorator này sử dụng để  serialize the response using Zod
  @MessageRes('Register successfully')
  async register(@Body() body: RegisterBodyDto) {
    const result = await this.authService.register(body)
    return result
  }

  @MessageRes('Send OTP successfully')
  @Post('send-otp')
  sendOtp(@Body() body: SendOtpBodyDto) {
    const result = this.authService.sendOtp(body)
    return result
  }

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
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenBodyDto) {
    const result = await this.authService.refreshToken(body)
    return result
  }

  // @Post('forgot-password')
  // forgotPassword(@Body() body: any) {
  //   return 'Forgot password route'
  // }
}
