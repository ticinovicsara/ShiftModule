import { Module } from '@nestjs/common';
import { SessionTypeService } from './session-type.service';
import { SessionTypeController } from './session-type.controller';
import { SessionTypeRepositoryModule } from '../shared/repositories';

@Module({
  imports: [SessionTypeRepositoryModule],
  controllers: [SessionTypeController],
  providers: [SessionTypeService],
  exports: [SessionTypeService],
})
export class SessionTypeModule {}
