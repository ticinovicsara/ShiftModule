import { BaseRepository } from '../base.repository';
import { Group } from '@repo/types';

/**
 * Group Repository Interface
 * Defines all methods for group data access and capacity management
 */
export interface IGroupRepository extends BaseRepository<Group> {
  /**
   * Find all groups for a specific session type
   * @param sessionTypeId - Session type ID
   * @returns Array of groups for that session type
   */
  findBySessionType(sessionTypeId: string): Promise<Group[]>;

  /**
   * Increment the current count for a group (when a student joins)
   * @param id - Group ID
   * @returns Updated group with incremented count
   */
  incrementCount(id: string): Promise<Group>;

  /**
   * Decrement the current count for a group (when a student leaves)
   * @param id - Group ID
   * @returns Updated group with decremented count (minimum 0)
   */
  decrementCount(id: string): Promise<Group>;

  /**
   * Check if a group has available capacity for new students
   * @param id - Group ID
   * @returns true if group is active and has room; false otherwise
   */
  hasCapacity(id: string): Promise<boolean>;
}
