import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@repo/types';
import { AuthGuard, Roles, RolesGuard } from '../auth';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all admins' })
  @ApiResponse({ status: 200, description: 'Admins fetched' })
  findAll() {
    const data = this.adminService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by id' })
  @ApiResponse({ status: 200, description: 'Admin fetched' })
  findOne(@Param('id') id: string) {
    const data = this.adminService.findOne(+id);
    return { data, error: null, message: 'OK' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin by id' })
  @ApiResponse({ status: 200, description: 'Admin deleted' })
  remove(@Param('id') id: string) {
    const data = this.adminService.remove(+id);
    return { data, error: null, message: 'Admin deleted' };
  }
}
