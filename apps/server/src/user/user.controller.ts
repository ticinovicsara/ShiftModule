import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@repo/types';
import { UserService } from './user.service';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all users, optionally filtered by role' })
  @ApiResponse({ status: 200, description: 'Users fetched' })
  async findAll(@Query('role') role?: UserRole) {
    const data = role
      ? await this.userService.findByRole(role)
      : await this.userService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get('batch')
  @ApiOperation({ summary: 'Get users by comma-separated ids' })
  @ApiResponse({ status: 200, description: 'Users fetched by ids' })
  async findByIds(@Query('ids') ids: string) {
    const idList = ids.split(',').filter(Boolean);
    const data = await this.userService.findByIds(idList);
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User fetched' })
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(id);
    return { data, error: null, message: 'OK' };
  }
}
