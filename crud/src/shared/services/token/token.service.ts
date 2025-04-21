import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import envConfig from 'src/shared/config'
import { TokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: { userId: number }): Promise<string> {
    const token = this.jwtService.signAsync(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    })
    return token
  }

  signRefreshToken(payload: { userId: number }): Promise<string> {
    const token = this.jwtService.signAsync(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    })
    return token
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      algorithms: ['HS256'],
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }
  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      algorithms: ['HS256'],
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
