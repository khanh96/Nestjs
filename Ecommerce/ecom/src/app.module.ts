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
import { PermissionModule } from './routes/permission/permission.module'
import { RoleModule } from './routes/role/role.module'
import { UserModule } from './routes/user/user.module'
import { MediaModule } from './routes/media/media.module'
import { BrandModule } from './routes/brand/brand.module'
import { BrandTranslationModule } from 'src/routes/brand/brand-translation/brand-translation.module'
import { I18nModule, QueryResolver, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n'
import { CategoryModule } from './routes/category/category.module';
import path from 'path'

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: HeaderResolver, options: ['x-language'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    SharedModule,
    AuthModule,
    LanguageModule,
    ProfileModule,
    PermissionModule,
    RoleModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
  ], // chứa các module.
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
