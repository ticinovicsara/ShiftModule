import { Module } from '@nestjs/common';
import { MockStudentCourseRepository } from '../../repositories/mock/mock-student-course.repository';

@Module({
  providers: [
    {
      provide: 'IStudentCourseRepository',
      useClass: MockStudentCourseRepository,
    },
  ],
  exports: ['IStudentCourseRepository'],
})
export class StudentCourseRepositoryModule {}
