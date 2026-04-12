import { Module } from '@nestjs/common';
import { MockSessionTypeRepository } from '../../repositories/mock/mock-session-type';

@Module({
  providers: [
    {
      provide: 'ISessionTypeRepository',
      useClass: MockSessionTypeRepository,
    },
  ],
  exports: ['ISessionTypeRepository'],
})
export class SessionTypeRepositoryModule {}
