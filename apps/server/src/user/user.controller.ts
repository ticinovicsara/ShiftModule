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
import { UserService } from './user.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const data = await this.userService.findAll();
    return { data, error: null, message: 'OK' };
  }

  @Get('students')
  async findStudents() {
    const data = await this.userService.findAllStudents();
    return { data, error: null, message: 'OK' };
  }

  @Get('professors')
  async findProfessors() {
    const data = await this.userService.findAllProfessors();
    return { data, error: null, message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(id);
    return { data, error: null, message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.userService.create(dto);
    return { data, error: null, message: 'User created' };
  }

  @Post('import')
  async import(@Body() users: CreateUserDto[]) {
    const data = await this.userService.importMany(users);
    return { data, error: null, message: `${data.length} users imported` };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.userService.update(id, dto);
    return { data, error: null, message: 'User updated' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.userService.remove(id);
    return { data, error: null, message: 'User deleted' };
  }
}
