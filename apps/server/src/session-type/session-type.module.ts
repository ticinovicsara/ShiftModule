import { Module } from '@nestjs/common';
import { SessionTypeService } from './session-type.service';
import { SessionTypeController } from './session-type.controller';
import { MockSessionTypeRepository } from 'src/repositories';

@Module({
  controllers: [SessionTypeController],
  providers: [SessionTypeService, MockSessionTypeRepository],
  exports: [SessionTypeService],
})
export class SessionTypeModule {}
