import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';

@Module({
  controllers: [GroupController],
  providers: [GroupService, MockGroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
