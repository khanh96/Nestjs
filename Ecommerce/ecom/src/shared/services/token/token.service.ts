import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { AccessTokenPayload, RefreshTokenPayload } from 'src/shared/types/jwt.type'
import { v4 as uuidv4 } from 'uuid'

/**
 * Thêm uuid vào payload để phân biệt các access token khác nhau khi có trường hợp payload giống nhau và tạo access_token cùng 1 thời điểm.
 */

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: { userId: number; deviceId: number; roleId: number; roleName: RoleName }): Promise<string> {
    const token = this.jwtService.signAsync(
      { ...payload, uuid: uuidv4() },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
    return token
  }

  signRefreshToken(payload: { userId: number }): Promise<string> {
    const token = this.jwtService.signAsync(
      { ...payload, uuid: uuidv4() },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
    return token
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      algorithms: ['HS256'],
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }
  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      algorithms: ['HS256'],
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
