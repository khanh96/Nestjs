import { INestApplication } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { ServerOptions, Server, Socket } from 'socket.io'
import envConfig from 'src/shared/config'
import { generateRoomUserId } from 'src/shared/helpers'
import { SharedWebsocketRepository } from 'src/shared/repositories/websocket.repo'
import { TokenService } from 'src/shared/services/token/token.service'

/**
 * Custom WebSocket Adapter to configure CORS settings for Socket.IO server.
 * This adapter extends the default IoAdapter provided by NestJS
 * and overrides the createIOServer method to set up CORS options.
 * It allows connections from any origin, which is useful for development
 * and testing purposes. Adjust the CORS settings as needed for production environments.
 */

const namespaces = ['/', 'payment', 'chat']

export class WebsocketAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>
  private readonly tokenService: TokenService
  private readonly sharedWebsocketRepository: SharedWebsocketRepository
  constructor(app: INestApplication<any>) {
    super(app)

    // Sử dụng Dependency Injection để lấy instance của TokenService và SharedWebsocketRepository từ NestJS application context.
    this.tokenService = app.get(TokenService)
    this.sharedWebsocketRepository = app.get(SharedWebsocketRepository)
  }

  createIOServer(port: number, options?: ServerOptions) {
    /**
     * Configure CORS to allow requests from any origin
     * This is important for WebSocket connections from different domains
     * You can adjust the CORS settings as per your security requirements
     * Here, we allow all origins for demonstration purposes
     * In production, consider restricting this to specific origins
     * See: https://socket.io/docs/v4/server-options/#cors
     */
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    })

    // Apply dụng cho namespace /
    server.use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })
    // Apply dụng cho tất cả các namespace trừ /
    server.of(/.*/).use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })
    // namespaces.forEach((item) => {
    //   server.of(item).use(authMiddleware)
    // })
    // server.use(authMiddleware)
    // server.of('payment').use(authMiddleware)
    // server.of('chat').use(authMiddleware)

    return server
  }

  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const { authorization } = socket.handshake.headers

    // console.log(socket.handshake.headers)

    if (!authorization) {
      return next(new Error('Authorization header is missing'))
    }
    const accessToken = authorization.split(' ')[1]

    if (!accessToken) {
      return next(new Error('Access token is missing'))
    }

    try {
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)

      // Join the user to their specific room
      await socket.join(generateRoomUserId(userId))
      // await this.sharedWebsocketRepository.create({
      //   id: socket.id,
      //   userId,
      // })
      // socket.on('disconnect', async () => {
      //   await this.sharedWebsocketRepository.delete(socket.id).catch(() => {})
      // })
      next()
    } catch (error) {
      next(error)
    }
  }

  // Kết nối đến Redis và thiết lập adapter cho Socket.IO server
  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://${envConfig.REDIS_HOST}:${envConfig.REDIS_PORT}` })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }
}
