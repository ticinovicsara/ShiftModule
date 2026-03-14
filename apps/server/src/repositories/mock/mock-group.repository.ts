import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs } from '../base.repository';
import { Group } from '@repo/types';
import { mockGroups } from './data/mock-groups.data';

export class MockGroupRepository extends BaseRepository<Group> {
  private store: Group[] = [...mockGroups];

  async findById(id: string): Promise<Group | null> {
    return this.store.find((g) => g.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<Group>): Promise<Group[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((g) =>
      Object.entries(where).every(([key, value]) => (g as any)[key] === value),
    );
  }

  async create(data: Omit<Group, 'id'>): Promise<Group> {
    const entity: Group = { ...data, id: randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(id: string, data: Partial<Group>): Promise<Group> {
    const index = this.store.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Group with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<Group> {
    const index = this.store.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Group with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }

  async findBySessionType(sessionTypeId: string): Promise<Group[]> {
    return this.store.filter((g) => g.sessionTypeId === sessionTypeId);
  }

  async incrementCount(id: string): Promise<Group> {
    const index = this.store.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Group with id ${id} not found`);
    const group = this.store[index];
    const updated = { ...group, currentCount: group.currentCount + 1 };
    this.store[index] = updated;
    return updated;
  }

  async decrementCount(id: string): Promise<Group> {
    const index = this.store.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Group with id ${id} not found`);
    const group = this.store[index];
    const updated = {
      ...group,
      currentCount: Math.max(0, group.currentCount - 1),
    };
    this.store[index] = updated;
    return updated;
  }

  async hasCapacity(id: string): Promise<boolean> {
    const group = await this.findById(id);
    if (!group) return false;
    return group.isActive && group.currentCount < group.capacity;
  }
}
