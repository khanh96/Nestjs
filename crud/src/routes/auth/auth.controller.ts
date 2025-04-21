import { Body, Controller, Post, SerializeOptions } from '@nestjs/common'
import { RegisterBodyDTO, RegisterResponseDTO } from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'

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
}
