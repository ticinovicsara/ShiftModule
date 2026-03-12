import { randomUUID } from 'crypto';
import { BaseRepository, FindManyArgs } from '../base.repository';
import { SwapRequest, SwapRequestStatus } from '@repo/types';
import { mockSwapRequests } from './data/mock-swap-requests.data';

export class MockSwapRequestRepository extends BaseRepository<SwapRequest> {
  private store: SwapRequest[] = [...mockSwapRequests];

  async findById(id: string): Promise<SwapRequest | null> {
    return this.store.find((sr) => sr.id === id) ?? null;
  }

  async findMany(args?: FindManyArgs<SwapRequest>): Promise<SwapRequest[]> {
    if (!args?.where) return [...this.store];
    const { where } = args;
    return this.store.filter((sr) =>
      Object.entries(where).every(([key, value]) => (sr as any)[key] === value),
    );
  }

  async create(data: SwapRequest): Promise<SwapRequest> {
    const now = new Date();
    const entity: SwapRequest = {
      ...data,
      id: data.id ?? randomUUID(),
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    };
    this.store.push(entity);
    return entity;
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
