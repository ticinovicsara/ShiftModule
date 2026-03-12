import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { StudentModule } from './student';
import { SwapRequestModule } from './swap-request';
import { ProfessorModule } from './professor';
import { AdminModule } from './admin';
import { UserModule } from './user/user.module';
import { StudyMajorModule } from './study-major/study-major.module';
import { CourseModule } from './course/course.module';
import { GroupModule } from './group/group.module';
import { NotificationModule } from './notification/notification.module';
import { SessionTypeModule } from './session-type/session-type.module';

@Module({
  imports: [
    StudentModule,
    AuthModule,
    AdminModule,
    ProfessorModule,
    SwapRequestModule,
    UserModule,
    StudyMajorModule,
    CourseModule,
    GroupModule,
    NotificationModule,
    SessionTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
