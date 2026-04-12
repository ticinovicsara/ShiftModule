import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import {
  GroupRepositoryModule,
  SessionTypeRepositoryModule,
  StudentCourseRepositoryModule,
  StudentGroupRepositoryModule,
  SwapRequestRepositoryModule,
} from '../shared/repositories';

@Module({
  imports: [
    GroupRepositoryModule,
    StudentGroupRepositoryModule,
    SessionTypeRepositoryModule,
    StudentCourseRepositoryModule,
    SwapRequestRepositoryModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
