import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from 'src/repositories';
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

  async findByRole(role: UserRole) {
    return this.userRepo.findByRole(role);
  }
}
