import { BaseRepository } from '../base.repository';
import { StudentGroup } from '@repo/types';

/**
 * StudentGroup Repository Interface
 * Defines all methods for student-group assignment data access
 */
export interface IStudentGroupRepository extends BaseRepository<StudentGroup> {
  /**
   * Find all group assignments for a specific student
   * @param studentId - Student ID
   * @returns Array of group assignments for that student
   */
  findByStudent(studentId: string): Promise<StudentGroup[]>;

  /**
   * Find all students assigned to a specific group
   * @param groupId - Group ID
   * @returns Array of student assignments in that group
   */
  findByGroup(groupId: string): Promise<StudentGroup[]>;

  /**
   * Find all unassigned student-group relationships
   * @returns Array of unassigned student-group pairs
   */
  findUnassigned(): Promise<StudentGroup[]>;
}
