import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs, matchesWhere } from '../base.repository';
import { StudyMajor } from '@repo/types';
import { IStudyMajorRepository } from '../interfaces/study-major.repository.interface';
import { mockStudyMajors } from './data/mock-study-majors.data';

export class MockStudyMajorRepository
  extends BaseRepository<StudyMajor>
  implements IStudyMajorRepository
{
  private store: StudyMajor[] = [...mockStudyMajors];

  async findById(id: string): Promise<StudyMajor | null> {
    return this.store.find((m) => m.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<StudyMajor>): Promise<StudyMajor[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((studyMajor) => matchesWhere(studyMajor, where));
  }

  async create(data: Omit<StudyMajor, 'id'>): Promise<StudyMajor> {
    const entity: StudyMajor = { ...data, id: randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(id: string, data: Partial<StudyMajor>): Promise<StudyMajor> {
    const index = this.store.findIndex((m) => m.id === id);
    if (index === -1) throw new Error(`StudyMajor with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<StudyMajor> {
    const index = this.store.findIndex((m) => m.id === id);
    if (index === -1) throw new Error(`StudyMajor with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }
}
