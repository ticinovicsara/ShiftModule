import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SessionKind, UserRole } from '@repo/types';
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

  @Get('courses/:courseId/students')
  @ApiOperation({ summary: 'Get enrolled students for current student course' })
  @ApiResponse({ status: 200, description: 'Course students fetched' })
  async getCourseStudents(
    @Req() request: Request,
    @Param('courseId') courseId: string,
    @Query('sessionTypeId') sessionTypeId?: string,
  ) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.studentService.getCourseStudents(
      studentId ?? '',
      courseId,
      sessionTypeId,
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

  @Post('admin/courses/:courseId/students/:studentId/enroll')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Enroll an existing student into a course without group assignment',
  })
  @ApiResponse({ status: 201, description: 'Student enrolled into course' })
  async enrollStudentWithoutGroup(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    const data = await this.studentService.enrollStudentWithoutGroup(
      courseId,
      studentId,
    );
    return {
      data,
      error: null,
      message: data.alreadyEnrolled
        ? 'Student already enrolled in course'
        : 'Student enrolled in course without group assignment',
    };
  }

  @Post('admin/courses/:courseId/students/auto-assign')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({
    summary:
      'Batch auto-assign ungrouped course students into available groups',
  })
  @ApiResponse({ status: 201, description: 'Auto-assignment finished' })
  async autoAssignUngroupedStudents(
    @Param('courseId') courseId: string,
    @Query('sessionKind') sessionKind?: SessionKind,
  ) {
    const data = await this.studentService.autoAssignUngroupedStudents(
      courseId,
      sessionKind,
    );
    return {
      data,
      error: null,
      message: 'Auto-assignment completed',
    };
  }

  @Post('admin/courses/:courseId/students/import')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Import existing local students into a course using JSON entries (no external sync)',
  })
  @ApiResponse({ status: 201, description: 'Student import processed' })
  async importExistingStudentsToCourse(
    @Param('courseId') courseId: string,
    @Body() payload: unknown,
  ) {
    const data = await this.studentService.importExistingStudentsToCourse(
      courseId,
      payload,
    );

    return {
      data,
      error: null,
      message: 'Student import processed',
    };
  }
}
