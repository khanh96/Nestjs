import helmet from 'helmet'
import { patchNestJsSwagger } from 'nestjs-zod'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WebsocketAdapter } from 'src/websockets/websocket.adapter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
// import { ConsoleLogger } from '@nestjs/common'
// import { LoggingInterceptor } from 'src/shared/interceptor/logging.interceptor'
import { Logger } from 'nestjs-pino'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  // Apply global logging interceptor
  // app.useGlobalInterceptors(new LoggingInterceptor())

  // Use helmet for security headers
  app.use(helmet())

  // Trust requests from loopback address (e.g., proxies like Nginx running on the same machine)
  app.set('trust proxy', 'loopback') // Trust requests from the loopback address

  // Enable CORS
  app.enableCors()

  // Swagger setup
  // Patch for NestJS Swagger to support Zod schemas
  patchNestJsSwagger()
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('The API for the ecommerce application')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        name: 'authorization',
        type: 'apiKey',
      },
      'payment-api-key',
    )
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  // WebSocket setup
  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)

  // Start the application
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
