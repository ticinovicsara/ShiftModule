import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { SwapRequestModule } from '../swap-request/swap-request.module';
import {
  CourseRepositoryModule,
  GroupRepositoryModule,
  SessionTypeRepositoryModule,
  StudentCourseRepositoryModule,
  StudentGroupRepositoryModule,
  UserRepositoryModule,
} from '../shared/repositories';

@Module({
  imports: [
    SwapRequestModule,
    CourseRepositoryModule,
    StudentCourseRepositoryModule,
    SessionTypeRepositoryModule,
    GroupRepositoryModule,
    StudentGroupRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
