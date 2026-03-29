import crypto from 'crypto';
import { BaseRepository, FindManyArgs, matchesWhere } from '../base.repository';
import { SwapRequest, SwapRequestStatus } from '@repo/types';
import { ISwapRequestRepository } from '../interfaces/swap-request.repository.interface';
import { mockSwapRequests } from './data/mock-swap-requests.data';

type CreateSwapRequestInput = Omit<
  SwapRequest,
  'id' | 'createdAt' | 'updatedAt'
>;

export class MockSwapRequestRepository
  extends BaseRepository<SwapRequest>
  implements ISwapRequestRepository
{
  private store: SwapRequest[] = [...mockSwapRequests];

  async findById(id: string): Promise<SwapRequest | null> {
    return this.store.find((sr) => sr.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<SwapRequest>): Promise<SwapRequest[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((swapRequest) => matchesWhere(swapRequest, where));
  }

  async create(data: CreateSwapRequestInput): Promise<SwapRequest> {
    const newRequest: SwapRequest = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.push(newRequest);
    return newRequest;
  }

  async update(id: string, data: Partial<SwapRequest>): Promise<SwapRequest> {
    const index = this.store.findIndex((sr) => sr.id === id);
    if (index === -1) throw new Error(`SwapRequest with id ${id} not found`);
    const updated: SwapRequest = {
      ...this.store[index],
      ...data,
      updatedAt: new Date(),
    };
    this.store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<SwapRequest> {
    const index = this.store.findIndex((sr) => sr.id === id);
    if (index === -1) throw new Error(`SwapRequest with id ${id} not found`);
    const [removed] = this.store.splice(index, 1);
    return removed;
  }

  async findByStudent(studentId: string): Promise<SwapRequest[]> {
    return this.store.filter((sr) => sr.studentId === studentId);
  }

  async findByCourse(courseId: string): Promise<SwapRequest[]> {
    return this.store.filter((sr) => sr.courseId === courseId);
  }

  async findPending(): Promise<SwapRequest[]> {
    return this.store.filter((sr) => sr.status === SwapRequestStatus.PENDING);
  }

  async findMatchingRequest(request: SwapRequest): Promise<SwapRequest | null> {
    return (
      this.store.find(
        (sr) =>
          sr.id !== request.id &&
          sr.currentGroupId === request.desiredGroupId &&
          sr.desiredGroupId === request.currentGroupId &&
          sr.status === SwapRequestStatus.PENDING,
      ) ?? null
    );
  }
}
