import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from 'src/shared/config'

Injectable()
export class TwoFactorAuthService {
  private createTOTP(email: string, secret?: string | OTPAuth.Secret): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    })
  }

  generateTOTPSecret(email: string): { secret: string; uri: any } {
    const totp = this.createTOTP(email)
    const secret = totp.secret.base32
    const uri = totp.toString()
    return {
      secret,
      uri,
    }
  }

  verifyTOTP({ email, token, secret }: { email: string; token: string; secret: string | OTPAuth.Secret }): boolean {
    const totp = this.createTOTP(email, secret)
    // window: 1 means it will allow the token to be valid for 1 time period before and after the current time
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  }
}
