import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import {
  MockGroupRepository,
  MockStudentGroupRepository,
} from '../repositories';

@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    {
      provide: 'IGroupRepository',
      useClass: MockGroupRepository,
    },
    {
      provide: 'IStudentGroupRepository',
      useClass: MockStudentGroupRepository,
    },
  ],
  exports: [GroupService],
})
export class GroupModule {}
