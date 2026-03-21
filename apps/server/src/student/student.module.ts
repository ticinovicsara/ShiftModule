import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import {
  MockStudentCourseRepository,
  MockStudentGroupRepository,
  MockSwapRequestRepository,
  MockCourseRepository,
  MockGroupRepository,
  MockSessionTypeRepository,
} from '../repositories';

@Module({
  controllers: [StudentController],
  providers: [
    StudentService,
    MockStudentCourseRepository,
    MockStudentGroupRepository,
    MockSwapRequestRepository,
    MockCourseRepository,
    MockGroupRepository,
    MockSessionTypeRepository,
  ],
})
export class StudentModule {}
