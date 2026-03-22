import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';
import { MockStudentCourseRepository } from '../repositories/mock/mock-student-course.repository';
import { MockSessionTypeRepository } from '../repositories/mock/mock-session-type';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { MockStudentGroupRepository } from '../repositories/mock/mock-student-group.repository';
import { MockUserRepository } from '../repositories/mock/mock-user.repository';
import { SwapRequestModule } from '../swap-request/swap-request.module';

@Module({
  imports: [SwapRequestModule],
  controllers: [CourseController],
  providers: [
    CourseService,
    MockCourseRepository,
    MockStudentCourseRepository,
    MockSessionTypeRepository,
    MockGroupRepository,
    MockStudentGroupRepository,
    MockUserRepository,
  ],
  exports: [CourseService],
})
export class CourseModule {}
