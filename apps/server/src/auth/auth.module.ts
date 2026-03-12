import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MockUserRepository } from '../repositories/mock/mock-user.repository';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from './auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MockUserRepository],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}
