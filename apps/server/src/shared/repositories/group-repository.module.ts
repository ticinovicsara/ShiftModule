import { Module } from '@nestjs/common';
import { MockGroupRepository } from '../../repositories/mock/mock-group.repository';

@Module({
  providers: [
    {
      provide: 'IGroupRepository',
      useClass: MockGroupRepository,
    },
  ],
  exports: ['IGroupRepository'],
})
export class GroupRepositoryModule {}
