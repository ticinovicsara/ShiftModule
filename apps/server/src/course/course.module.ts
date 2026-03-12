import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';

@Module({
  controllers: [CourseController],
  providers: [CourseService, MockCourseRepository],
  exports: [CourseService],
})
export class CourseModule {}
