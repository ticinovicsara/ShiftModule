import { BaseRepository } from '../base.repository';
import { User, UserRole } from '@repo/types';

/**
 * User Repository Interface
 * Defines all methods for user data access and business logic queries
 */
export interface IUserRepository extends BaseRepository<User> {
  /**
   * Find a user by their email address
   * @param email - User email to search for
   * @returns User or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users with a specific role
   * @param role - UserRole enum (ADMIN, PROFESSOR, STUDENT)
   * @returns Array of users matching the role
   */
  findByRole(role: UserRole): Promise<User[]>;
}
