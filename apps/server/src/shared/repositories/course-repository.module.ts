import { Module } from '@nestjs/common';
import { MockCourseRepository } from '../../repositories/mock/mock-course.repository';

@Module({
  providers: [
    {
      provide: 'ICourseRepository',
      useClass: MockCourseRepository,
    },
  ],
  exports: ['ICourseRepository'],
})
export class CourseRepositoryModule {}
