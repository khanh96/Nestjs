import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from 'src/routes/auth/auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const result = await this.authService.login(body)
    return result
  }

  @Post('logout')
  async logout(@Body() body: any) {
    const result = await this.authService.logout(body)
    return result
  }

  @Post('register')
  async register(@Body() body: any) {
    console.log(body)
    const result = await this.authService.register(body)
    return result
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    const result = await this.authService.refreshToken(body)
    return result
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: any) {
    return 'Forgot password route'
  }
}
