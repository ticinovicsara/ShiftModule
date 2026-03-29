import { BaseRepository } from '../base.repository';
import { SwapRequest } from '@repo/types';

/**
 * SwapRequest Repository Interface
 * Defines all methods for swap request data access and business logic queries
 */
export interface ISwapRequestRepository extends BaseRepository<SwapRequest> {
  /**
   * Find all swap requests initiated by a specific student
   * @param studentId - Student ID
   * @returns Array of swap requests from that student
   */
  findByStudent(studentId: string): Promise<SwapRequest[]>;

  /**
   * Find all swap requests for a specific course
   * @param courseId - Course ID
   * @returns Array of swap requests in that course
   */
  findByCourse(courseId: string): Promise<SwapRequest[]>;

  /**
   * Find all pending swap requests (awaiting approval or partner confirmation)
   * @returns Array of pending swap requests
   */
  findPending(): Promise<SwapRequest[]>;

  /**
   * Find a matching swap request for the given request
   * Matches are requests where the desired/current groups are swapped
   * @param request - Swap request to find match for
   * @returns Matching request or null if none found
   */
  findMatchingRequest(request: SwapRequest): Promise<SwapRequest | null>;
}
