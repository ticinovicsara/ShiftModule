import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@repo/types';
import { StudyMajorService } from './study-major.service';
import type { CreateStudyMajorDto } from './dto/create-study-major.dto';
import type { UpdateStudyMajorDto } from './dto/update-study-major.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('admin/study-majors')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StudyMajorController {
  constructor(private readonly studyMajorService: StudyMajorService) {}

  @Get()
  async findAll() {
    const data = await this.studyMajorService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.studyMajorService.findById(id);
    return { data, error: null, message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateStudyMajorDto) {
    const data = await this.studyMajorService.create(dto);
    return { data, error: null, message: 'Study major created' };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStudyMajorDto) {
    const data = await this.studyMajorService.update(id, dto);
    return { data, error: null, message: 'Study major updated' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.studyMajorService.remove(id);
    return { data, error: null, message: 'Study major deleted' };
  }
}
