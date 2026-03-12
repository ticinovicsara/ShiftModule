import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('student')
@UseGuards(AuthGuard, RolesGuard)
@Roles('STUDENT')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('courses')
  async getMyCourses(@Param('id') id: string) {
    const data = await this.studentService.getMyCourses(id);
    return { data, error: null, message: 'OK' };
  }

  @Get('requests')
  async getMyRequests(@Param('id') id: string) {
    const data = await this.studentService.getMyRequests(id);
    return { data, error: null, message: 'OK' };
  }
}
