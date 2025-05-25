import { Module } from '@nestjs/common'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleService } from 'src/routes/auth/google.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository, GoogleService],
})
export class AuthModule {}
