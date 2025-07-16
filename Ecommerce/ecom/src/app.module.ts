import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
// import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter'
import { CustomZodSerializerInterceptor } from 'src/shared/interceptor/custom-zod-serializer.interceptor'
import CustomZodValidationPipe from 'src/shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from 'src/shared/shared.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import { LanguageModule } from 'src/routes/language/language.module'
import { ProfileModule } from './routes/profile/profile.module'

@Module({
  imports: [SharedModule, AuthModule, LanguageModule, ProfileModule], // chứa các module.
  controllers: [AppController], // chứa controller
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe, // Custom Zod validation pipe for request validation
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomZodSerializerInterceptor, // Zod serializer interceptor for response serialization
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // Custom exception filter for handling HTTP exceptions
    },
  ], // chứa service, repository, provider, .
})
export class AppModule {}
