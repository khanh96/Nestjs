import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { RegisterBodyDto, RegisterResponseDto } from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { MessageRes } from 'src/shared/decorators/message.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto) // decorator này sử dụng để  serialize the response using Zod
  @MessageRes('Register1111 successfully')
  async register(@Body() body: RegisterBodyDto) {
    const result = await this.authService.register(body)
    return {
      ...result,
      message: 'Register successfully',
    }
  }

  // @Post('login')
  // async login(@Body() body: any) {
  //   const result = await this.authService.login(body)
  //   return result
  // }

  // @Post('logout')
  // async logout(@Body() body: any) {
  //   const result = await this.authService.logout(body)
  //   return result
  // }

  // @Post('refresh-token')
  // async refreshToken(@Body() body: any) {
  //   const result = await this.authService.refreshToken(body)
  //   return result
  // }

  // @Post('forgot-password')
  // forgotPassword(@Body() body: any) {
  //   return 'Forgot password route'
  // }
}
