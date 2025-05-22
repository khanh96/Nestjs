import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  LoginBodyDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { MessageRes } from 'src/shared/decorators/message.decorator'

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
  @Post('login')
  async login(@Body() body: LoginBodyDto) {
    const result = await this.authService.login(body)
    return result
  }

  @MessageRes('Logout successfully')
  @Post('logout')
  async logout(@Body() body: LogoutBodyDto) {
    await this.authService.logout(body)
    return true
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
