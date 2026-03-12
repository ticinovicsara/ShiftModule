import { Module } from '@nestjs/common';
import { StudyMajorService } from './study-major.service';
import { StudyMajorController } from './study-major.controller';
import { MockStudyMajorRepository } from 'src/repositories';

@Module({
  controllers: [StudyMajorController],
  providers: [StudyMajorService, MockStudyMajorRepository],
  exports: [StudyMajorService],
})
export class StudyMajorModule {}
