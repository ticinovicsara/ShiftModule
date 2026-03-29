import { Module } from '@nestjs/common';
import { AdminModule } from './admin';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { CourseModule } from './course';
import { GroupModule } from './group';
import { NotificationModule } from './notification';
import { ProfessorModule } from './professor';
import { SessionTypeModule } from './session-type';
import { StudentModule } from './student';
import { StudyMajorModule } from './study-major';
import { SwapRequestModule } from './swap-request';
import { UserModule } from './user';
import { AppController } from './app.controller';
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
    AdminModule,
    ProfessorModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
