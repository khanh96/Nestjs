import { Body, Controller, Post, SerializeOptions, UseGuards } from '@nestjs/common'
import {
  LoginBodyDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResponseDTO,
  RegisterBodyDTO,
  RegisterResponseDTO,
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseInterceptors(ClassSerializerInterceptor) // serialize cho một request
  @SerializeOptions({ type: RegisterResponseDTO }) // This will serialize the response using the RegisterResponseDTO class
  @Post('register')
  async register(@Body() body: RegisterBodyDTO): Promise<RegisterResponseDTO> {
    // console.log(body)
    const result = await this.authService.register(body)
    return new RegisterResponseDTO(result.result)
  }

  @Post('login')
  async login(@Body() body: LoginBodyDTO): Promise<LoginResponseDTO> {
    const result = await this.authService.login(body)

    return new LoginResponseDTO({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  }

  // @UseGuards(AccessTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenBodyDTO): Promise<RefreshTokenResponseDTO> {
    const result = await this.authService.refreshToken(body.refreshToken)
    return new RefreshTokenResponseDTO({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  }

  @Post('logout')
  async logout(@Body() body: RefreshTokenBodyDTO): Promise<LogoutResponseDTO> {
    const result = await this.authService.logout(body.refreshToken)

    return new LogoutResponseDTO(result)
  }
}
