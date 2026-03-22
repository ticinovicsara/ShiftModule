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
import type { Request } from 'express';
import { CourseService } from './course.service';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';
import { SwapMode, UserRole } from '@repo/types';
import type { ReportIssueDto } from '../group/dto/report-issue.dto';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('admin/courses')
  @Roles(UserRole.ADMIN)
  async findAll() {
    const data = await this.courseService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Post('admin/courses')
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateCourseDto) {
    const data = await this.courseService.create(dto);
    return { data, error: null, message: 'Course created' };
  }

  @Patch('admin/courses/:id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    const data = await this.courseService.update(id, dto);
    return { data, error: null, message: 'Course updated' };
  }

  @Post('admin/courses/:id/assign-professor')
  @Roles(UserRole.ADMIN)
  async assignProfessor(
    @Param('id') id: string,
    @Body() body: { professorId: string },
  ) {
    const data = await this.courseService.assignProfessor(id, body.professorId);
    return { data, error: null, message: 'Professor assigned' };
  }

  @Get('admin/courses/:id')
  @Roles(UserRole.ADMIN)
  async findOneForAdmin(@Param('id') id: string) {
    const data = await this.courseService.getCourseDetail(id);
    return { data, error: null, message: 'OK' };
  }

  @Delete('admin/courses/:id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.courseService.remove(id);
    return { data, error: null, message: 'Course deleted' };
  }

  @Get('professor/courses')
  @Roles(UserRole.PROFESSOR)
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
  async findOne(@Param('id') id: string) {
    const data = await this.courseService.getCourseDetail(id);
    return { data, error: null, message: 'OK' };
  }

  @Get('professor/dashboard/stats')
  @Roles(UserRole.PROFESSOR)
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
  async setSwapMode(@Param('id') id: string, @Body() body: { mode: SwapMode }) {
    const data = await this.courseService.setSwapMode(id, body.mode);
    return { data, error: null, message: 'Swap mode updated' };
  }

  @Post('courses/:id/report-issue')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  async reportIssue(@Param('id') id: string, @Body() dto: ReportIssueDto) {
    const data = await this.courseService.reportIssue(id, dto);
    return { data, error: null, message: 'Issue reported' };
  }
}
