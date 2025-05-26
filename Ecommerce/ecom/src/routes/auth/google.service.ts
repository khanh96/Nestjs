import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { AuthService } from 'src/routes/auth/auth.service'
import { RolesService } from 'src/routes/auth/roles.service'
import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { UserRepository } from 'src/shared/repositories/user.repo'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class GoogleService {
  private readonly oauth2client: OAuth2Client
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly authRepository: AuthRepository,
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
  ) {
    this.oauth2client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  getGoogleLink(
    userAgent: string,
    ipAddress: string,
  ): {
    url: string
  } {
    // 1.  Create Scope
    const scope = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
    //2. Create State String
    // Chuyển Object sang string base64url để sử dụng làm state
    const stateString = Buffer.from(
      JSON.stringify({
        userAgent: userAgent,
        ipAddress: ipAddress,
      }),
    ).toString('base64url')

    // 3. Generate Auth URL with state
    const url = this.oauth2client.generateAuthUrl({
      access_type: 'offline',
      scope: scope,
      state: stateString, // Chuyển đổi state thành base64url
      prompt: 'consent', // Yêu cầu người dùng xác nhận quyền truy cập
    })

    return {
      url: url,
    }
  }

  async googleCallback({ code, state }: { code: string; state: string }): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    try {
      // 1. Parse state
      const stateString = Buffer.from(state, 'base64url').toString('utf-8')
      const { userAgent, ipAddress } = JSON.parse(stateString)

      // 2. Get tokens from code
      const { tokens } = await this.oauth2client.getToken(code)

      // 3. Set credentials with the obtained tokens
      this.oauth2client.setCredentials(tokens)

      // 4. Use the OAuth2 client to get user profile information
      const oauth2 = google.oauth2({
        auth: this.oauth2client,
        version: 'v2',
      })

      const userInfo = await oauth2.userinfo.get()

      const { email, name, picture } = userInfo.data

      // 5. Check user exist in Db
      if (!email) {
        throw new Error('Email is required but was not provided.')
      }
      let user = await this.userRepository.findUserByEmailIncludeRole(email)

      // 6. If user not exist
      if (!user) {
        const roleId = await this.rolesService.getClientRoleId()
        const randomPassword = uuidv4() // Generate a random password
        const hashedPassword = await this.hashingService.hash(randomPassword)

        const newUser = await this.authRepository.createUserIncludeRole({
          email: email,
          password: hashedPassword,
          name: name ?? '',
          phoneNumber: '',
          roleId: roleId,
          avatar: picture ?? '',
        })
        user = newUser
      }

      // 7. If user exist
      const {
        id,
        roleId,
        role: { name: roleName },
      } = user

      //8.  Create device
      const device = await this.authRepository.createDevice({
        ip: ipAddress,
        userAgent: userAgent,
        userId: id,
      })

      //9. Generate tokens
      const { accessToken, refreshToken } = await this.authService.generateTokens({
        userId: id,
        deviceId: device.id,
        roleId: roleId,
        roleName: roleName as RoleName,
      })

      return {
        accessToken,
        refreshToken,
      }
    } catch (error) {
      console.log(error)
      throw new Error('Google authentication failed. Please try again later.')
    }
  }
}
