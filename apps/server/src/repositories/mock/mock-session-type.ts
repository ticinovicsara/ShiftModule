import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs, matchesWhere } from '../base.repository';
import { SessionType } from '@repo/types';
import { ISessionTypeRepository } from '../interfaces/session-type.repository.interface';
import { mockSessionTypes } from './data/mock-session-types.data';

export class MockSessionTypeRepository
  extends BaseRepository<SessionType>
  implements ISessionTypeRepository
{
  private store: SessionType[] = [...mockSessionTypes];

  async findById(id: string): Promise<SessionType | null> {
    return this.store.find((a) => a.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<SessionType>): Promise<SessionType[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((sessionType) => matchesWhere(sessionType, where));
  }

  async findByCourse(courseId: string): Promise<SessionType[]> {
    return this.store.filter((s) => s.courseId === courseId);
  }

  async create(data: Omit<SessionType, 'id'>): Promise<SessionType> {
    const entity: SessionType = { ...data, id: randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(id: string, data: Partial<SessionType>): Promise<SessionType> {
    const index = this.store.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`SessionType with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<SessionType> {
    const index = this.store.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`SessionType with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }
}
