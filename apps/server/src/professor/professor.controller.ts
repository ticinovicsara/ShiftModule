import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@repo/types';
import { AuthGuard, Roles, RolesGuard } from '../auth';
import { ProfessorService } from './professor.service';

@Controller('professors')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('professors')
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}

  @Get()
  @ApiOperation({ summary: 'List all professors' })
  @ApiResponse({ status: 200, description: 'Professors fetched' })
  findAll() {
    const data = this.professorService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get professor by id' })
  @ApiResponse({ status: 200, description: 'Professor fetched' })
  findOne(@Param('id') id: string) {
    const data = this.professorService.findOne(+id);
    return { data, error: null, message: 'OK' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete professor by id' })
  @ApiResponse({ status: 200, description: 'Professor deleted' })
  remove(@Param('id') id: string) {
    const data = this.professorService.remove(+id);
    return { data, error: null, message: 'Professor deleted' };
  }
}
