import { Module } from '@nestjs/common';
import { MockStudyMajorRepository } from '../../repositories/mock/mock-study-major.repository';

@Module({
  providers: [
    {
      provide: 'IStudyMajorRepository',
      useClass: MockStudyMajorRepository,
    },
  ],
  exports: ['IStudyMajorRepository'],
})
export class StudyMajorRepositoryModule {}
