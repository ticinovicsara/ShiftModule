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
import { GroupService } from './group.service';
import { UserRole } from '@repo/types';
import type { CreateGroupDto } from './dto/create-group.dto';
import type { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('admin/groups')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  async findAll() {
    const data = await this.groupService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Post('admin/groups')
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateGroupDto) {
    const data = await this.groupService.create(dto);
    return { data, error: null, message: 'Group created' };
  }

  @Patch('admin/groups/:id/capacity')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  async updateCapacity(
    @Param('id') id: string,
    @Body() body: { capacity: number },
  ) {
    const data = await this.groupService.updateCapacity(id, body.capacity);
    return { data, error: null, message: 'Capacity updated' };
  }

  @Patch('admin/groups/:id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    const data = await this.groupService.update(id, dto);
    return { data, error: null, message: 'Group updated' };
  }

  @Delete('admin/groups/:id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.groupService.remove(id);
    return { data, error: null, message: 'Group deleted' };
  }

  @Post('admin/students/:studentId/move-to-group/:groupId')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  async moveStudentToGroup(
    @Param('studentId') studentId: string,
    @Param('groupId') groupId: string,
  ) {
    const data = await this.groupService.moveStudentToGroup(studentId, groupId);
    return { data, error: null, message: data.message };
  }
}
