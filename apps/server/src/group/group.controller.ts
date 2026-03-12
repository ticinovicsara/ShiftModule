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
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ReportIssueDto } from './dto/report-issue.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('admin/groups')
  @Roles('ADMIN')
  async findAll() {
    const data = await this.groupService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Post('admin/groups')
  @Roles('ADMIN')
  async create(@Body() dto: CreateGroupDto) {
    const data = await this.groupService.create(dto);
    return { data, error: null, message: 'Group created' };
  }

  @Patch('admin/groups/:id/capacity')
  @Roles('ADMIN')
  async updateCapacity(
    @Param('id') id: string,
    @Body() body: { capacity: number },
  ) {
    const data = await this.groupService.updateCapacity(id, body.capacity);
    return { data, error: null, message: 'Capacity updated' };
  }

  @Patch('admin/groups/:id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    const data = await this.groupService.update(id, dto);
    return { data, error: null, message: 'Group updated' };
  }

  @Delete('admin/groups/:id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const data = await this.groupService.remove(id);
    return { data, error: null, message: 'Group deleted' };
  }

  @Post('groups/:id/report-issue')
  @Roles('ADMIN', 'PROFESSOR')
  async reportIssue(@Param('id') id: string, @Body() dto: ReportIssueDto) {
    const data = await this.groupService.reportIssue(id, dto);
    return { data, error: null, message: 'Issue reported' };
  }
}
