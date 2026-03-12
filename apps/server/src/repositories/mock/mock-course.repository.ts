import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs } from '../base.repository';
import { Course } from '@repo/types';
import { mockCourses } from './data/mock-courses.data';
import { mockActivityTypes } from './data/mock-activity-types.data';

export class MockCourseRepository extends BaseRepository<Course> {
  private store: Course[] = [...mockCourses];

  async findById(id: string): Promise<Course | null> {
    return this.store.find((c) => c.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<Course>): Promise<Course[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((c) =>
      Object.entries(where).every(([key, value]) => (c as any)[key] === value),
    );
  }

  async create(data: Course): Promise<Course> {
    const entity: Course = { ...data, id: data.id ?? randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(id: string, data: Partial<Course>): Promise<Course> {
    const index = this.store.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Course with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<Course> {
    const index = this.store.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Course with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }

  async findByMajor(majorId: string): Promise<Course[]> {
    return this.store.filter((c) => c.studyMajorId === majorId);
  }

  async findWithActivityTypes(id: string): Promise<Course | null> {
    const course = await this.findById(id);
    if (!course) return null;
    // In-memory composition; caller can separately query activity types
    const activityTypes = mockActivityTypes.filter(
      (at) => at.courseId === course.id,
    );
    return { ...course, activityTypes } as any;
  }
}

