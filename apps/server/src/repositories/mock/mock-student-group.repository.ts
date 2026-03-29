import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs, matchesWhere } from '../base.repository';
import { StudentGroup, StudentGroupStatus } from '@repo/types';
import { IStudentGroupRepository } from '../interfaces/student-group.repository.interface';
import { mockStudentGroups } from './data/mock-student-groups.data';

export class MockStudentGroupRepository
  extends BaseRepository<StudentGroup>
  implements IStudentGroupRepository
{
  private store: StudentGroup[] = [...mockStudentGroups];

  async findById(id: string): Promise<StudentGroup | null> {
    return this.store.find((sg) => sg.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<StudentGroup>): Promise<StudentGroup[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((studentGroup) =>
      matchesWhere(studentGroup, where),
    );
  }

  async create(data: StudentGroup): Promise<StudentGroup> {
    const entity: StudentGroup = { ...data, id: data.id ?? randomUUID() };
    this.store.push(entity);
    return entity;
  }

  async update(id: string, data: Partial<StudentGroup>): Promise<StudentGroup> {
    const index = this.store.findIndex((sg) => sg.id === id);
    if (index === -1) throw new Error(`StudentGroup with id ${id} not found`);
    const updated = { ...this.store[index], ...data };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<StudentGroup> {
    const index = this.store.findIndex((sg) => sg.id === id);
    if (index === -1) throw new Error(`StudentGroup with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }

  async findByStudent(studentId: string): Promise<StudentGroup[]> {
    return this.store.filter((sg) => sg.studentId === studentId);
  }

  async findByGroup(groupId: string): Promise<StudentGroup[]> {
    return this.store.filter((sg) => sg.groupId === groupId);
  }

  async findUnassigned(): Promise<StudentGroup[]> {
    return this.store.filter(
      (sg) => sg.status === StudentGroupStatus.UNASSIGNED,
    );
  }
}
