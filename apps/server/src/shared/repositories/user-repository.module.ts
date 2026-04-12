import { Module } from '@nestjs/common';
import { MockUserRepository } from '../../repositories/mock/mock-user.repository';

@Module({
  providers: [
    {
      provide: 'IUserRepository',
      useClass: MockUserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UserRepositoryModule {}
