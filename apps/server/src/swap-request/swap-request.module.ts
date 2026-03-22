import { Module } from '@nestjs/common';
import { SwapRequestService } from './swap-request.service';
import { SwapRequestController } from './swap-request.controller';
import { MockSwapRequestRepository } from '../repositories/mock/mock-swap-request.repository';
import { MockStudentGroupRepository } from '../repositories/mock/mock-student-group.repository';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { MockStudentCourseRepository } from '../repositories/mock/mock-student-course.repository';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';
import { MockUserRepository } from '../repositories/mock/mock-user.repository';
import { MockSessionTypeRepository } from 'src/repositories';

@Module({
  controllers: [SwapRequestController],
  providers: [
    SwapRequestService,
    MockSwapRequestRepository,
    MockStudentGroupRepository,
    MockGroupRepository,
    MockStudentCourseRepository,
    MockCourseRepository,
    MockUserRepository,
    MockSessionTypeRepository,
    {
      provide: 'UserRepository',
      useClass: MockUserRepository,
    },
  ],
  exports: [SwapRequestService],
})
export class SwapRequestModule {}
