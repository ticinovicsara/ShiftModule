import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@repo/types';
import { UserService } from './user.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Users fetched' })
  async findAll() {
    const data = await this.userService.findAll();
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

  @Get('students')
  @ApiOperation({ summary: 'List all students' })
  @ApiResponse({ status: 200, description: 'Students fetched' })
  async findStudents() {
    const data = await this.userService.findAllStudents();
    return { data, error: null, message: 'OK' };
  }

  @Get('professors')
  @ApiOperation({ summary: 'List all professors' })
  @ApiResponse({ status: 200, description: 'Professors fetched' })
  async findProfessors() {
    const data = await this.userService.findAllProfessors();
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User fetched' })
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(id);
    return { data, error: null, message: 'OK' };
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'student1@fesb.hr' },
        firstName: { type: 'string', example: 'Ivan' },
        lastName: { type: 'string', example: 'Horvat' },
        role: { type: 'string', example: 'STUDENT' },
      },
      required: ['email', 'firstName', 'lastName', 'role'],
    },
  })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body() dto: CreateUserDto) {
    const data = await this.userService.create(dto);
    return { data, error: null, message: 'User created' };
  }

  @Post('import')
  @ApiOperation({ summary: 'Bulk import users' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'student1@fesb.hr' },
          firstName: { type: 'string', example: 'Ivan' },
          lastName: { type: 'string', example: 'Horvat' },
          role: { type: 'string', example: 'STUDENT' },
        },
        required: ['email', 'firstName', 'lastName', 'role'],
      },
      example: [
        {
          email: 'student1@fesb.hr',
          firstName: 'Ivan',
          lastName: 'Horvat',
          role: 'STUDENT',
        },
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Users imported' })
  async import(@Body() users: CreateUserDto[]) {
    const data = await this.userService.importMany(users);
    return { data, error: null, message: `${data.length} users imported` };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'updated.user@fesb.hr' },
        firstName: { type: 'string', example: 'Ivo' },
        lastName: { type: 'string', example: 'Horvatic' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.userService.update(id, dto);
    return { data, error: null, message: 'User updated' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async remove(@Param('id') id: string) {
    const data = await this.userService.remove(id);
    return { data, error: null, message: 'User deleted' };
  }
}
