import { Module } from '@nestjs/common';
import { SwapRequestService } from './swap-request.service';
import { SwapRequestController } from './swap-request.controller';
import { MockSwapRequestRepository } from '../repositories/mock/mock-swap-request.repository';
import { MockStudentGroupRepository } from '../repositories/mock/mock-student-group.repository';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { MockStudentCourseRepository } from '../repositories/mock/mock-student-course.repository';

@Module({
  controllers: [SwapRequestController],
  providers: [
    SwapRequestService,
    MockSwapRequestRepository,
    MockStudentGroupRepository,
    MockGroupRepository,
    MockStudentCourseRepository,
  ],
  exports: [SwapRequestService],
})
export class SwapRequestModule {}
