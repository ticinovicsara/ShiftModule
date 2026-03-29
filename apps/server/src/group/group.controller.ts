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
import { GroupService } from './group.service';
import { UserRole } from '@repo/types';
import type { CreateGroupDto } from './dto/create-group.dto';
import type { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('group')
@ApiBearerAuth()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('admin/groups')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'List groups' })
  @ApiResponse({ status: 200, description: 'Groups fetched' })
  async findAll() {
    const data = await this.groupService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Post('admin/groups')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create group' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'LAB A1' },
        capacity: { type: 'number', example: 30 },
        sessionTypeId: { type: 'string', example: 'session-lab-1' },
      },
      required: ['name', 'capacity', 'sessionTypeId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Group created' })
  async create(@Body() dto: CreateGroupDto) {
    const data = await this.groupService.create(dto);
    return { data, error: null, message: 'Group created' };
  }

  @Patch('admin/groups/:id/capacity')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Update group capacity' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        capacity: { type: 'number', example: 32 },
      },
      required: ['capacity'],
    },
  })
  @ApiResponse({ status: 200, description: 'Capacity updated' })
  async updateCapacity(
    @Param('id') id: string,
    @Body() body: { capacity: number },
  ) {
    const data = await this.groupService.updateCapacity(id, body.capacity);
    return { data, error: null, message: 'Capacity updated' };
  }

  @Patch('admin/groups/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update group' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'LAB A2' },
        capacity: { type: 'number', example: 28 },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Group updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    const data = await this.groupService.update(id, dto);
    return { data, error: null, message: 'Group updated' };
  }

  @Delete('admin/groups/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete group' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  async remove(@Param('id') id: string) {
    const data = await this.groupService.remove(id);
    return { data, error: null, message: 'Group deleted' };
  }

  @Post('admin/students/:studentId/move-to-group/:groupId')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Move student to another group' })
  @ApiResponse({ status: 201, description: 'Student moved' })
  async moveStudentToGroup(
    @Param('studentId') studentId: string,
    @Param('groupId') groupId: string,
  ) {
    const data = await this.groupService.moveStudentToGroup(studentId, groupId);
    return { data, error: null, message: data.message };
  }
}
