import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';
import { SwapMode, UserRole } from '@repo/types';
import type { ReportIssueDto } from '../group/dto/report-issue.dto';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('course')
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('admin/courses')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all courses (admin)' })
  @ApiResponse({ status: 200, description: 'Courses fetched' })
  async findAll() {
    const data = await this.courseService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Post('admin/courses')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create course (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Osnove računarstva' },
        studyMajorId: {
          type: 'string',
          example: 'major-preddiplomski-racunarstvo-1',
        },
        merlinUrl: {
          type: 'string',
          example: 'https://merlin.srce.hr/course/view.php?id=123',
        },
      },
      required: ['title', 'studyMajorId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Course created' })
  async create(@Body() dto: CreateCourseDto) {
    const data = await this.courseService.create(dto);
    return { data, error: null, message: 'Course created' };
  }

  @Patch('admin/courses/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update course (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Napredne osnove računarstva' },
        studyMajorId: {
          type: 'string',
          example: 'major-preddiplomski-racunarstvo-1',
        },
        professorId: { type: 'string', example: 'user-professor-1' },
        merlinUrl: {
          type: 'string',
          example: 'https://merlin.srce.hr/course/view.php?id=123',
        },
        swapMode: { type: 'string', example: 'AUTO' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Course updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    const data = await this.courseService.update(id, dto);
    return { data, error: null, message: 'Course updated' };
  }

  @Post('admin/courses/:id/assign-professor')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign professor to course (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        professorId: { type: 'string', example: 'user-professor-1' },
      },
      required: ['professorId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Professor assigned' })
  async assignProfessor(
    @Param('id') id: string,
    @Body() body: { professorId: string },
  ) {
    const data = await this.courseService.assignProfessor(id, body.professorId);
    return { data, error: null, message: 'Professor assigned' };
  }

  @Get('admin/courses/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get course detail (admin)' })
  @ApiResponse({ status: 200, description: 'Course fetched' })
  async findOneForAdmin(@Param('id') id: string) {
    const data = await this.courseService.getCourseDetail(id);
    return { data, error: null, message: 'OK' };
  }

  @Delete('admin/courses/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete course (admin)' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  async remove(@Param('id') id: string) {
    const data = await this.courseService.remove(id);
    return { data, error: null, message: 'Course deleted' };
  }

  @Get('professor/courses')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: 'List my courses (professor)' })
  @ApiResponse({ status: 200, description: 'Courses fetched' })
  async findMyCoruses(@Req() request: Request) {
    const professorId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.courseService.findCoursesByProfessor(
      professorId ?? '',
    );
    return { data, error: null, message: 'OK' };
  }

  @Get('professor/courses/:id')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Get course detail (professor)' })
  @ApiResponse({ status: 200, description: 'Course fetched' })
  async findOne(@Param('id') id: string) {
    const data = await this.courseService.getCourseDetail(id);
    return { data, error: null, message: 'OK' };
  }

  @Get('professor/dashboard/stats')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Get professor dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard stats fetched' })
  async getProfessorDashboardStats(@Req() request: Request) {
    const professorId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.courseService.getProfessorDashboardStats(
      professorId ?? '',
    );
    return { data, error: null, message: 'OK' };
  }

  @Patch('professor/courses/:id/swap-mode')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Update course swap mode (professor)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mode: { type: 'string', example: 'MANUAL' },
      },
      required: ['mode'],
    },
  })
  @ApiResponse({ status: 200, description: 'Swap mode updated' })
  async setSwapMode(@Param('id') id: string, @Body() body: { mode: SwapMode }) {
    const data = await this.courseService.setSwapMode(id, body.mode);
    return { data, error: null, message: 'Swap mode updated' };
  }

  @Post('courses/:id/report-issue')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Report course issue to IT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'OTHER' },
        description: {
          type: 'string',
          example: 'There is a schedule conflict for group LAB A1.',
        },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({ status: 201, description: 'Issue reported' })
  async reportIssue(@Param('id') id: string, @Body() dto: ReportIssueDto) {
    const data = await this.courseService.reportIssue(id, dto);
    return { data, error: null, message: 'Issue reported' };
  }
}
