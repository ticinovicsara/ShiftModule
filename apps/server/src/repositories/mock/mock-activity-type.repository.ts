import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs } from '../base.repository';
import { ActivityType } from '@repo/types';
import { mockActivityTypes } from './data/mock-activity-types.data';

export class MockActivityTypeRepository extends BaseRepository<ActivityType> {
  private store: ActivityType[] = [...mockActivityTypes];

  async findById(id: string): Promise<ActivityType | null> {
    return this.store.find((a) => a.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<ActivityType>): Promise<ActivityType[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((a) =>
      Object.entries(where).every(([key, value]) => (a as any)[key] === value),
    );
  }

  async create(data: ActivityType): Promise<ActivityType> {
    const entity: ActivityType = { ...data, id: data.id ?? randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(id: string, data: Partial<ActivityType>): Promise<ActivityType> {
    const index = this.store.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`ActivityType with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<ActivityType> {
    const index = this.store.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`ActivityType with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }
}

