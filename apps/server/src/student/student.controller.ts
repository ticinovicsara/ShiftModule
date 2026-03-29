import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@repo/types';
import { StudentService } from './student.service';
import { AuthGuard, RolesGuard, Roles } from '../auth';
import type { Request } from 'express';

@Controller('student')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@ApiTags('student')
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Get courses for current student' })
  @ApiResponse({ status: 200, description: 'Student courses fetched' })
  async getMyCourses(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getMyCourses(studentId ?? '');
    return { data, error: null, message: 'OK' };
  }

  @Get('course-overviews')
  @ApiOperation({ summary: 'Get student course overviews with request stats' })
  @ApiResponse({ status: 200, description: 'Course overviews fetched' })
  async getCourseOverviews(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getCourseOverviews(studentId ?? '');
    return { data, error: null, message: 'OK' };
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get detailed student course view' })
  @ApiResponse({ status: 200, description: 'Course detail fetched' })
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
  @ApiOperation({ summary: 'Get swap requests for current student' })
  @ApiResponse({ status: 200, description: 'Student requests fetched' })
  async getMyRequests(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getMyRequests(studentId ?? '');
    return { data, error: null, message: 'OK' };
  }
}
