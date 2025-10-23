import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { Request } from 'express'
import { REQUEST_ROLE_PERMISSIONS_KEY, REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'
import { TokenService } from 'src/shared/services/token/token.service'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()

    // Extract and validate the access token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Optionally, Check user permissions or roles if needed
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: Request): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)

    // Check if the token is valid
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken // Attach the user ID to the request object for later use
      return decodedAccessToken
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid access token',
        error: error,
      })
    }
  }

  private extractAccessTokenFromHeader(request: Request): string {
    const authorizationHeader = request.headers['authorization']
    const accessToken = typeof authorizationHeader === 'string' ? authorizationHeader.split(' ')[1] : null // Extract the token from the Authorization header

    // Check if the token is present
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing')
    }

    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: Request): Promise<void> {
    const roleId = decodedAccessToken.roleId
    const method = request.method as keyof typeof HTTPMethod
    const path = request.route.path as string
    const role = await this.prismaService.role
      .findFirstOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
          isActive: true,
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path: path,
              method: method,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException()
      })

    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      throw new ForbiddenException()
    }
    // Attach role permissions to request object for later use
    request[REQUEST_ROLE_PERMISSIONS_KEY] = role
  }
}
