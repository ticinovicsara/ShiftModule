import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs, matchesWhere } from '../base.repository';
import { User, UserRole } from '@repo/types';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { mockUsers } from './data/mock-users.data';

export class MockUserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  private store: User[] = [...mockUsers];

  async findById(id: string): Promise<User | null> {
    return this.store.find((u) => u.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<User>): Promise<User[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((user) => matchesWhere(user, where));
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: randomUUID(),
    };
    this.store.push(newUser);
    return newUser;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.store.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<User> {
    const index = this.store.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    const [removed] = this.store.splice(index, 1);
    return removed;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.find((u) => u.email === email) ?? null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.store.filter((u) => u.role === role);
  }
}
