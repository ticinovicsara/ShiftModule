import { Module } from '@nestjs/common';
import { AuthModule } from './auth';
import { CourseModule } from './course';
import { GroupModule } from './group';
import { NotificationModule } from './notification';
import { SessionTypeModule } from './session-type';
import { StudentModule } from './student';
import { StudyMajorModule } from './study-major';
import { SwapRequestModule } from './swap-request';
import { UserModule } from './user';
import { HealthController } from './health.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    StudyMajorModule,
    CourseModule,
    GroupModule,
    SessionTypeModule,
    StudentModule,
    SwapRequestModule,
    NotificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
