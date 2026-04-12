import { Module } from '@nestjs/common';
import { SwapRequestService } from './swap-request.service';
import { SwapRequestController } from './swap-request.controller';
import { NotificationModule } from '../notification/notification.module';
import {
  CourseRepositoryModule,
  GroupRepositoryModule,
  SessionTypeRepositoryModule,
  StudentCourseRepositoryModule,
  StudentGroupRepositoryModule,
  SwapRequestRepositoryModule,
  UserRepositoryModule,
} from '../shared/repositories';

@Module({
  imports: [
    NotificationModule,
    SwapRequestRepositoryModule,
    StudentGroupRepositoryModule,
    GroupRepositoryModule,
    StudentCourseRepositoryModule,
    CourseRepositoryModule,
    SessionTypeRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [SwapRequestController],
  providers: [SwapRequestService],
  exports: [SwapRequestService],
})
export class SwapRequestModule {}
