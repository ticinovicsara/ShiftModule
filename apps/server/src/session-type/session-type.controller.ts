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
import { SessionTypeService } from './session-type.service';
import type { CreateSessionTypeDto } from './dto/create-session-type.dto';
import type { UpdateSessionTypeDto } from './dto/update-session-type.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('admin/session-types')
@UseGuards(AuthGuard, RolesGuard)
export class SessionTypeController {
  constructor(private readonly sessionTypeService: SessionTypeService) {}

  @Get()
  @Roles('ADMIN', 'PROFESSOR')
  async findAll() {
    const data = await this.sessionTypeService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get('course/:courseId')
  @Roles('ADMIN', 'PROFESSOR')
  async findByCourse(@Param('courseId') courseId: string) {
    const data = await this.sessionTypeService.findByCourse(courseId);
    return { data, error: null, message: 'OK' };
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateSessionTypeDto) {
    const data = await this.sessionTypeService.create(dto);
    return { data, error: null, message: 'Session type created' };
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateSessionTypeDto) {
    const data = await this.sessionTypeService.update(id, dto);
    return { data, error: null, message: 'Session type updated' };
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const data = await this.sessionTypeService.remove(id);
    return { data, error: null, message: 'Session type deleted' };
  }
}
