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
    {
      provide: 'IStudentCourseRepository',
      useClass: MockStudentCourseRepository,
    },
    {
      provide: 'IStudentGroupRepository',
      useClass: MockStudentGroupRepository,
    },
    {
      provide: 'ISwapRequestRepository',
      useClass: MockSwapRequestRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: MockCourseRepository,
    },
    {
      provide: 'IGroupRepository',
      useClass: MockGroupRepository,
    },
    {
      provide: 'ISessionTypeRepository',
      useClass: MockSessionTypeRepository,
    },
  ],
})
export class StudentModule {}
