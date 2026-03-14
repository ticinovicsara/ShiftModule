import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  MockSwapRequestRepository,
  MockStudentGroupRepository,
  MockGroupRepository,
  MockStudentCourseRepository,
} from '../repositories';
import { SwapRequestStatus } from '@repo/types';
import { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import { RejectSwapRequestDto } from './dto/reject-swap-request.dto';

@Injectable()
export class SwapRequestService {
  constructor(
    private readonly swapRequestRepo: MockSwapRequestRepository,
    private readonly studentGroupRepo: MockStudentGroupRepository,
    private readonly groupRepo: MockGroupRepository,
    private readonly studentCourseRepo: MockStudentCourseRepository,
  ) {}


  async getMyRequests(studentId: string) {
    return this.swapRequestRepo.findByStudent(studentId);
  }

  async createRequest(studentId: string, dto: CreateSwapRequestDto) {
    const enrollments = await this.studentCourseRepo.findByStudent(studentId);
    if (!enrollments.some((e) => e.courseId === dto.courseId)) {
      throw new BadRequestException('Student not enrolled in this course');
    }

    const existing = await this.swapRequestRepo.findByStudent(studentId);
    const hasPending = existing.some(
      (r) =>
        r.activityTypeId === dto.activityTypeId &&
        r.status === SwapRequestStatus.PENDING,
    );
    if (hasPending) {
      throw new ConflictException(
        'Already has pending request for this activity',
      );
    }

    const desiredGroup = await this.groupRepo.findById(dto.desiredGroupId);
    if (!desiredGroup) throw new NotFoundException('Desired group not found');

    const hasCapacity = await this.groupRepo.hasCapacity(dto.desiredGroupId);
    if (!hasCapacity && !dto.partnerEmail) {
      throw new BadRequestException('Desired group is full');
    }

    const previousAttempts = existing.filter(
      (r) =>
        r.activityTypeId === dto.activityTypeId &&
        r.status === SwapRequestStatus.REJECTED,
    ).length;

    const mockGpa = Math.random() * 3 + 2;
    const priorityScore =
      0 * 0.4 +
      (mockGpa / 5.0) * 0.3 +
      (Math.min(previousAttempts, 5) / 5) * 0.3;

    const request = await this.swapRequestRepo.create({
      studentId,
      courseId: dto.courseId,
      activityTypeId: dto.activityTypeId,
      currentGroupId: dto.currentGroupId,
      desiredGroupId: dto.desiredGroupId,
      secondChoiceGroupId: dto.secondChoiceGroupId,
      reason: dto.reason,
      partnerEmail: dto.partnerEmail,
      partnerConfirmed: false,
      status: SwapRequestStatus.PENDING,
      priorityScore,
      satisfiedWish: undefined,
    });

    await this.tryAutoProcess(request.id);
    return request;
  }

  async confirmPartner(requestId: string, studentId: string) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Request is no longer pending');
    }

    await this.swapRequestRepo.update(requestId, { partnerConfirmed: true });
    await this.tryAutoProcess(requestId);
    return { message: 'Partner confirmed' };
  }

  async getCourseRequests(
    courseId: string,
    mode: 'MANUAL' | 'SEMI_AUTO' | 'AUTO',
  ) {
    const requests = await this.swapRequestRepo.findByCourse(courseId);

    if (mode === 'MANUAL') {
      return requests.filter((r) => r.status === SwapRequestStatus.PENDING);
    }

    if (mode === 'SEMI_AUTO') {
      return requests.filter(
        (r) => r.status === SwapRequestStatus.PENDING && !r.partnerConfirmed,
      );
    }

    return requests.filter((r) => r.status === SwapRequestStatus.AUTO_RESOLVED);
  }

  async approveRequest(requestId: string) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    const hasCapacity = await this.groupRepo.hasCapacity(
      request.desiredGroupId,
    );
    if (!hasCapacity) throw new BadRequestException('Desired group is full');

    await this.executeSwap(
      request.studentId,
      request.currentGroupId,
      request.desiredGroupId,
    );

    return this.swapRequestRepo.update(requestId, {
      status: SwapRequestStatus.APPROVED,
      satisfiedWish: true,
    });
  }

  async rejectRequest(requestId: string, dto: RejectSwapRequestDto) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    return this.swapRequestRepo.update(requestId, {
      status: SwapRequestStatus.REJECTED,
      satisfiedWish: false,
      reason: dto.reason ?? request.reason,
    });
  }

  async tryAutoProcess(requestId: string) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request || request.status !== SwapRequestStatus.PENDING) return;

    const match = await this.swapRequestRepo.findMatchingRequest(request);
    if (!match) return;

    await this.executeSwap(
      request.studentId,
      request.currentGroupId,
      request.desiredGroupId,
    );
    await this.executeSwap(
      match.studentId,
      match.currentGroupId,
      match.desiredGroupId,
    );

    await this.swapRequestRepo.update(request.id, {
      status: SwapRequestStatus.AUTO_RESOLVED,
      satisfiedWish: true,
    });
    await this.swapRequestRepo.update(match.id, {
      status: SwapRequestStatus.AUTO_RESOLVED,
      satisfiedWish: true,
    });
  }

  private async executeSwap(
    studentId: string,
    fromGroupId: string,
    toGroupId: string,
  ) {
    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);
    const currentGroup = studentGroups.find((g) => g.groupId === fromGroupId);
    if (!currentGroup)
      throw new NotFoundException('Student not in source group');

    await this.studentGroupRepo.update(currentGroup.id, { groupId: toGroupId });
    await this.groupRepo.decrementCount(fromGroupId);
    await this.groupRepo.incrementCount(toGroupId);
  }
}
