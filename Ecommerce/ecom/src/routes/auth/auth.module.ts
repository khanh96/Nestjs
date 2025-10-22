import { Module } from '@nestjs/common'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { ShareRoleRepository } from 'src/shared/repositories/role.repo'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleService } from 'src/routes/auth/google.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, ShareRoleRepository, AuthRepository, GoogleService],
})
export class AuthModule {}
