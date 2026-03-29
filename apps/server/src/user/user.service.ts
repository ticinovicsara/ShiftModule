import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { IUserRepository } from 'src/repositories';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@repo/types';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async findAll() {
    return this.userRepo.findMany();
  }

  async findById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByIds(ids: string[]) {
    const users = await this.userRepo.findMany();
    const idSet = new Set(ids);

    return users
      .filter((user) => idSet.has(user.id))
      .map(({ id, firstName, lastName, email, role }) => ({
        id,
        firstName,
        lastName,
        email,
        role,
      }));
  }

  async findByEmail(email: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundException(`User ${email} not found`);
    return user;
  }

  async findByRole(role: UserRole) {
    return this.userRepo.findByRole(role);
  }

  async findAllStudents() {
    return this.userRepo.findByRole(UserRole.STUDENT);
  }

  async findAllProfessors() {
    return this.userRepo.findByRole(UserRole.PROFESSOR);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already exists');
    return this.userRepo.create(dto);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    return this.userRepo.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.userRepo.delete(id);
  }

  async importMany(users: CreateUserDto[]) {
    return Promise.all(users.map((u) => this.create(u)));
  }
}
