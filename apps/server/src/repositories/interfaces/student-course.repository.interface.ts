import { BaseRepository } from '../base.repository';
import { StudentCourse } from '@repo/types';

/**
 * StudentCourse Repository Interface
 * Defines all methods for student-course enrollment data access
 */
export interface IStudentCourseRepository extends BaseRepository<StudentCourse> {
  /**
   * Find all course enrollments for a specific student
   * @param studentId - Student ID
   * @returns Array of courses the student is enrolled in
   */
  findByStudent(studentId: string): Promise<StudentCourse[]>;

  /**
   * Find all students enrolled in a specific course
   * @param courseId - Course ID
   * @returns Array of student enrollments in that course
   */
  findByCourse(courseId: string): Promise<StudentCourse[]>;
}
