import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MockUserRepository } from '../repositories';

@Module({
  controllers: [UserController],
  providers: [UserService, MockUserRepository],
  exports: [UserService],
})
export class UserModule {}
