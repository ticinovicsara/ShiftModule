import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard, RolesGuard, Roles } from '../auth';
import type { Request } from 'express';

@Controller('student')
@UseGuards(AuthGuard, RolesGuard)
@Roles('STUDENT')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('courses')
  async getMyCourses(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getMyCourses(studentId ?? '');
    return { data, error: null, message: 'OK' };
  }

  @Get('course-overviews')
  async getCourseOverviews(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getCourseOverviews(studentId ?? '');
    return { data, error: null, message: 'OK' };
  }

  @Get('courses/:courseId')
  async getCourseDetail(
    @Req() request: Request,
    @Param('courseId') courseId: string,
  ) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getCourseDetail(
      studentId ?? '',
      courseId,
    );
    return { data, error: null, message: 'OK' };
  }

  @Get('requests')
  async getMyRequests(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getMyRequests(studentId ?? '');
    return { data, error: null, message: 'OK' };
  }
}
