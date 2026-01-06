import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import { Request } from 'express'
import { keyBy } from 'lodash'
import { REQUEST_ROLE_PERMISSIONS_KEY, REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { generateCacheKeyRole } from 'src/shared/helpers'
import { RolePermissionsType } from 'src/shared/models/role.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'
import { TokenService } from 'src/shared/services/token/token.service'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

type Permission = RolePermissionsType['permissions'][number]
type CachedRole = RolePermissionsType & {
  permissions: {
    [key: string]: Permission
  }
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    // const method = request.method as keyof typeof HTTPMethod
    // const path = request.route.path as string

    const cacheKey = generateCacheKeyRole(roleId)
    // 1. Thử lấy từ cache
    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey)
    // Log cached role để biết có lấy được từ cache hay không? Khi nào cache hit, khi nào cache miss.
    console.log('cachedRole from cache=>', cachedRole)

    // 2. Nếu không có trong cache, thì truy vấn từ cơ sở dữ liệu
    if (!cachedRole) {
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
              },
            },
          },
        })
        .catch(() => {
          throw new ForbiddenException()
        })

      const permissionObject = keyBy(
        role.permissions,
        (permission) => `${permission.path}:${permission.method}`,
      ) as CachedRole['permissions']

      cachedRole = { ...role, permissions: permissionObject }

      await this.cacheManager.set(cacheKey, cachedRole, 1000 * 60 * 60) // Cache for 1 hour

      // Attach role permissions to request object for later use
      request[REQUEST_ROLE_PERMISSIONS_KEY] = role
    }
  }
}
