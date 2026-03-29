import { Module } from '@nestjs/common';
import { SwapRequestService } from './swap-request.service';
import { SwapRequestController } from './swap-request.controller';
import { MockSwapRequestRepository } from '../repositories/mock/mock-swap-request.repository';
import { MockStudentGroupRepository } from '../repositories/mock/mock-student-group.repository';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { MockStudentCourseRepository } from '../repositories/mock/mock-student-course.repository';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';
import { MockUserRepository } from '../repositories/mock/mock-user.repository';
import { MockSessionTypeRepository } from '../repositories';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [SwapRequestController],
  providers: [
    SwapRequestService,
    {
      provide: 'ISwapRequestRepository',
      useClass: MockSwapRequestRepository,
    },
    {
      provide: 'IStudentGroupRepository',
      useClass: MockStudentGroupRepository,
    },
    {
      provide: 'IGroupRepository',
      useClass: MockGroupRepository,
    },
    {
      provide: 'IStudentCourseRepository',
      useClass: MockStudentCourseRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: MockCourseRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: MockUserRepository,
    },
    {
      provide: 'ISessionTypeRepository',
      useClass: MockSessionTypeRepository,
    },
  ],
  exports: [SwapRequestService],
})
export class SwapRequestModule {}
