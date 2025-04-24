import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { LoggingInterceptor } from 'src/shared/interceptor/logging.interceptor'
import { TransformInterceptor } from 'src/shared/interceptor/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các thuộc tính không có trong DTO
      forbidNonWhitelisted: true, // Ném lỗi nếu có thuộc tính không có trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu được khai báo trong DTO
      // transformOptions: {
      //   enableImplicitConversion: true, // Tự động chuyển đổi kiểu dữ liệu được khai báo trong DTO (123 => '123')
      // },
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException(
          {
            errors: errors.map((error) => ({
              field: error.property,
              message: Object.values(error.constraints as any).join(', '),
            })),
          },
          {
            description: 'Validation failed for the request',
            cause: errors,
          },
        )
      }, // Tùy chỉnh lỗi trả về cho người dùng
    }),
  )
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new TransformInterceptor())
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
