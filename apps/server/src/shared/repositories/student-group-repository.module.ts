import { Module } from '@nestjs/common';
import { MockStudentGroupRepository } from '../../repositories/mock/mock-student-group.repository';

@Module({
  providers: [
    {
      provide: 'IStudentGroupRepository',
      useClass: MockStudentGroupRepository,
    },
  ],
  exports: ['IStudentGroupRepository'],
})
export class StudentGroupRepositoryModule {}
