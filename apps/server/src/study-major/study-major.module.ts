import { Module } from '@nestjs/common';
import { StudyMajorService } from './study-major.service';
import { StudyMajorController } from './study-major.controller';
import { StudyMajorRepositoryModule } from '../shared/repositories';

@Module({
  imports: [StudyMajorRepositoryModule],
  controllers: [StudyMajorController],
  providers: [StudyMajorService],
  exports: [StudyMajorService],
})
export class StudyMajorModule {}
