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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@repo/types';
import { StudyMajorService } from './study-major.service';
import type { CreateStudyMajorDto } from './dto/create-study-major.dto';
import type { UpdateStudyMajorDto } from './dto/update-study-major.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('admin/study-majors')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('study-major')
@ApiBearerAuth()
export class StudyMajorController {
  constructor(private readonly studyMajorService: StudyMajorService) {}

  @Get()
  @ApiOperation({ summary: 'List study majors' })
  @ApiResponse({ status: 200, description: 'Study majors fetched' })
  async findAll() {
    const data = await this.studyMajorService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get study major by id' })
  @ApiResponse({ status: 200, description: 'Study major fetched' })
  async findOne(@Param('id') id: string) {
    const data = await this.studyMajorService.findById(id);
    return { data, error: null, message: 'OK' };
  }

  @Post()
  @ApiOperation({ summary: 'Create study major' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Preddiplomski računarstvo' },
        year: { type: 'number', example: 1 },
      },
      required: ['title', 'year'],
    },
  })
  @ApiResponse({ status: 201, description: 'Study major created' })
  async create(@Body() dto: CreateStudyMajorDto) {
    const data = await this.studyMajorService.create(dto);
    return { data, error: null, message: 'Study major created' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update study major' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Diplomski računarstvo' },
        year: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Study major updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudyMajorDto) {
    const data = await this.studyMajorService.update(id, dto);
    return { data, error: null, message: 'Study major updated' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete study major' })
  @ApiResponse({ status: 200, description: 'Study major deleted' })
  async remove(@Param('id') id: string) {
    const data = await this.studyMajorService.remove(id);
    return { data, error: null, message: 'Study major deleted' };
  }
}
