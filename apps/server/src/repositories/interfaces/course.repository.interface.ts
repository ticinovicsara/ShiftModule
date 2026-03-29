import { BaseRepository } from '../base.repository';
import { Course, SessionType } from '@repo/types';

/**
 * Course with SessionTypes - extended type for specific queries
 */
export type CourseWithSessionTypes = Course & {
  sessionTypes: SessionType[];
};

/**
 * Course Repository Interface
 * Defines all methods for course data access and business logic queries
 */
export interface ICourseRepository extends BaseRepository<Course> {
  /**
   * Find all courses for a specific study major
   * @param majorId - Study major ID
   * @returns Array of courses in that major
   */
  findByMajor(majorId: string): Promise<Course[]>;

  /**
   * Find a course by ID with all its associated session types
   * @param id - Course ID
   * @returns Course with sessionTypes array or null if not found
   */
  findWithSessionTypes(id: string): Promise<CourseWithSessionTypes | null>;
}
