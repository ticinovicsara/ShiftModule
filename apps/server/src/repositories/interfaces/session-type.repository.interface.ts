import { BaseRepository } from '../base.repository';
import { SessionType } from '@repo/types';

/**
 * SessionType Repository Interface
 * Defines all methods for session type data access
 */
export interface ISessionTypeRepository extends BaseRepository<SessionType> {
  /**
   * Find all session types for a specific course
   * @param courseId - Course ID
   * @returns Array of session types in that course
   */
  findByCourse(courseId: string): Promise<SessionType[]>;
}
