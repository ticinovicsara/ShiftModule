import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs, matchesWhere } from '../base.repository';
import { StudentCourse } from '@repo/types';
import { mockStudentCourses } from './data/mock-student-courses.data';

export class MockStudentCourseRepository extends BaseRepository<StudentCourse> {
  private store: StudentCourse[] = [...mockStudentCourses];

  async findById(id: string): Promise<StudentCourse | null> {
    return this.store.find((sc) => sc.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<StudentCourse>): Promise<StudentCourse[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((studentCourse) =>
      matchesWhere(studentCourse, where),
    );
  }

  async create(data: StudentCourse): Promise<StudentCourse> {
    const entity: StudentCourse = { ...data, id: data.id ?? randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(
    id: string,
    data: Partial<StudentCourse>,
  ): Promise<StudentCourse> {
    const index = this.store.findIndex((sc) => sc.id === id);
    if (index === -1) throw new Error(`StudentCourse with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<StudentCourse> {
    const index = this.store.findIndex((sc) => sc.id === id);
    if (index === -1) throw new Error(`StudentCourse with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }

  async findByStudent(studentId: string): Promise<StudentCourse[]> {
    return this.store.filter((sc) => sc.studentId === studentId);
  }

  async findByCourse(courseId: string): Promise<StudentCourse[]> {
    return this.store.filter((sc) => sc.courseId === courseId);
  }
}
