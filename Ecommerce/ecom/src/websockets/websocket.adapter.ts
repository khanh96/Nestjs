import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions, Server, Socket } from 'socket.io'

/**
 * Custom WebSocket Adapter to configure CORS settings for Socket.IO server.
 * This adapter extends the default IoAdapter provided by NestJS
 * and overrides the createIOServer method to set up CORS options.
 * It allows connections from any origin, which is useful for development
 * and testing purposes. Adjust the CORS settings as needed for production environments.
 */

const namespaces = ['/', 'payment', 'chat']

export class WebsocketAdapter extends IoAdapter {
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
    const authMiddleware = (socket: Socket, next: (err?: any) => void) => {
      console.log('connected', socket.id)
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
      next()
    }
    // Apply dụng cho namespace /
    server.use(authMiddleware)
    // Áp dụng cho các namespace cụ thể trừ /
    server.of(/.*/).use(authMiddleware)
    // namespaces.forEach((item) => {
    //   server.of(item).use(authMiddleware)
    // })
    // server.use(authMiddleware)
    // server.of('payment').use(authMiddleware)
    // server.of('chat').use(authMiddleware)

    return server
  }
}
