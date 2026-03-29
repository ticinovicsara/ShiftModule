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
import { SessionTypeService } from './session-type.service';
import { UserRole } from '@repo/types';
import type { CreateSessionTypeDto } from './dto/create-session-type.dto';
import type { UpdateSessionTypeDto } from './dto/update-session-type.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('session-types')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('session-types')
@ApiBearerAuth()
export class SessionTypeController {
  constructor(private readonly sessionTypeService: SessionTypeService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'List session types' })
  @ApiResponse({ status: 200, description: 'Session types fetched' })
  async findAll() {
    const data = await this.sessionTypeService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get('course/:courseId')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'List session types by course' })
  @ApiResponse({ status: 200, description: 'Session types fetched' })
  async findByCourse(@Param('courseId') courseId: string) {
    const data = await this.sessionTypeService.findByCourse(courseId);
    return { data, error: null, message: 'OK' };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create session type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', example: 'course-osnove-1' },
        type: { type: 'string', example: 'LAB' },
      },
      required: ['courseId', 'type'],
    },
  })
  @ApiResponse({ status: 201, description: 'Session type created' })
  async create(@Body() dto: CreateSessionTypeDto) {
    const data = await this.sessionTypeService.create(dto);
    return { data, error: null, message: 'Session type created' };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update session type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'EXERCISE' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Session type updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateSessionTypeDto) {
    const data = await this.sessionTypeService.update(id, dto);
    return { data, error: null, message: 'Session type updated' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete session type' })
  @ApiResponse({ status: 200, description: 'Session type deleted' })
  async remove(@Param('id') id: string) {
    const data = await this.sessionTypeService.remove(id);
    return { data, error: null, message: 'Session type deleted' };
  }
}
