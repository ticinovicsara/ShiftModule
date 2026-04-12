import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
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
    StudentCourseRepositoryModule,
    StudentGroupRepositoryModule,
    SwapRequestRepositoryModule,
    CourseRepositoryModule,
    GroupRepositoryModule,
    SessionTypeRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
