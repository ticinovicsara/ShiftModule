import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import {
  MockCourseRepository,
  MockUserRepository,
  MockSwapRequestRepository,
  MockStudentGroupRepository,
  MockGroupRepository,
  MockSessionTypeRepository,
  MockStudentCourseRepository,
} from '../repositories';
import {
  StudentSwapViewState,
  SessionKind,
  SwapMode,
  SwapRequest,
  SwapRequestStatus,
  SwapRequestType,
  UserRole,
} from '@repo/types';
import { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import { RejectSwapRequestDto } from './dto/reject-swap-request.dto';

@Injectable()
export class SwapRequestService {
  constructor(
    private readonly swapRequestRepo: MockSwapRequestRepository,
    private readonly studentGroupRepo: MockStudentGroupRepository,
    private readonly groupRepo: MockGroupRepository,
    private readonly sessionTypeRepo: MockSessionTypeRepository,
    private readonly studentCourseRepo: MockStudentCourseRepository,
    private readonly courseRepo: MockCourseRepository,
    @Inject('UserRepository') private readonly userRepo: MockUserRepository,
  ) {}

  private requireStudentId(studentId?: string) {
    if (!studentId) {
      throw new BadRequestException('Missing authenticated student id');
    }
    return studentId;
  }

  private normalizeEmail(email?: string) {
    return (email ?? '').trim().toLowerCase();
  }

  private isPaired(request: SwapRequest) {
    return request.requestType === SwapRequestType.PAIRED;
  }

  private isVisibleToStaff(request: SwapRequest) {
    if (!this.isPaired(request)) {
      return true;
    }
    return (
      request.partnerConfirmed || request.status === SwapRequestStatus.REJECTED
    );
  }

  private getProcessingMode(request: SwapRequest): 'MANUAL' | 'AUTOMATIC' {
    return request.status === SwapRequestStatus.AUTO_RESOLVED
      ? 'AUTOMATIC'
      : 'MANUAL';
  }

  private buildStaffDedupKey(request: SwapRequest) {
    if (!this.isPaired(request)) {
      return request.id;
    }

    const participantA = request.studentId;
    const participantB = request.partnerStudentId ?? request.partnerEmail ?? '';
    const participants = [participantA, participantB].sort().join('|');
    const groups = [request.currentGroupId, request.desiredGroupId]
      .sort()
      .join('|');

    return [
      request.courseId,
      request.sessionTypeId,
      request.status,
      participants,
      groups,
    ].join('|');
  }

  private dedupeStaffCards(requests: SwapRequest[]) {
    const deduped = new Map<string, SwapRequest>();
    for (const request of requests) {
      const key = this.buildStaffDedupKey(request);
      if (!deduped.has(key)) {
        deduped.set(key, request);
      }
    }
    return Array.from(deduped.values());
  }

  private getStudentViewState(
    request: SwapRequest,
    viewerId: string,
    viewerEmail: string,
  ): StudentSwapViewState {
    if (request.status === SwapRequestStatus.AUTO_RESOLVED) {
      return StudentSwapViewState.AUTO_PROCESSED;
    }

    if (request.status === SwapRequestStatus.APPROVED) {
      return StudentSwapViewState.MANUALLY_APPROVED;
    }

    if (request.status === SwapRequestStatus.REJECTED) {
      return StudentSwapViewState.MANUALLY_REJECTED;
    }

    if (!this.isPaired(request)) {
      return StudentSwapViewState.QUEUED_FOR_REVIEW;
    }

    const isIncomingPartnerRequest =
      request.studentId !== viewerId &&
      this.normalizeEmail(request.partnerEmail) === viewerEmail;

    if (isIncomingPartnerRequest && !request.partnerConfirmed) {
      return StudentSwapViewState.INCOMING_PARTNER_CONFIRMATION;
    }

    if (!isIncomingPartnerRequest && !request.partnerConfirmed) {
      return StudentSwapViewState.AWAITING_PARTNER_CONFIRMATION;
    }

    return StudentSwapViewState.QUEUED_FOR_REVIEW;
  }

  private async enrichSwapRequestWithStudent(request: SwapRequest) {
    const [course, currentGroup, desiredGroup] = await Promise.all([
      this.courseRepo.findById(request.courseId),
      this.groupRepo.findById(request.currentGroupId),
      this.groupRepo.findById(request.desiredGroupId),
    ]);

    return {
      ...request,
      courseTitle: course?.title,
      currentGroupName: currentGroup?.name,
      desiredGroupName: desiredGroup?.name,
    };
  }

  async getMyRequests(studentId?: string) {
    const resolvedStudentId = this.requireStudentId(studentId);
    const currentStudent = await this.userRepo.findById(resolvedStudentId);
    if (!currentStudent) {
      throw new NotFoundException('Student not found');
    }

    const ownRequests =
      await this.swapRequestRepo.findByStudent(resolvedStudentId);
    const incomingRequests = await this.swapRequestRepo.findMany({
      where: { partnerEmail: currentStudent.email },
    });

    const merged = new Map<string, SwapRequest>();
    [...ownRequests, ...incomingRequests].forEach((request) => {
      merged.set(request.id, request);
    });

    const enriched = await Promise.all(
      Array.from(merged.values()).map((request) =>
        this.enrichSwapRequestWithStudent(request),
      ),
    );

    return enriched.map((request) => {
      const normalizedViewerEmail = this.normalizeEmail(currentStudent.email);
      const isIncomingPartnerRequest =
        request.requestType === SwapRequestType.PAIRED &&
        request.studentId !== resolvedStudentId &&
        this.normalizeEmail(request.partnerEmail) === normalizedViewerEmail;

      return {
        ...request,
        isIncomingPartnerRequest,
        processingMode: this.getProcessingMode(request),
        studentViewState: this.getStudentViewState(
          request,
          resolvedStudentId,
          normalizedViewerEmail,
        ),
      };
    });
  }

  async getAllRequests(courseId?: string) {
    let requests: SwapRequest[];
    if (courseId) {
      requests = await this.swapRequestRepo.findByCourse(courseId);
    } else {
      requests = await this.swapRequestRepo.findMany();
    }

    const enriched = await Promise.all(
      requests.map((request) => this.enrichSwapRequestWithStudent(request)),
    );

    return this.dedupeStaffCards(
      enriched
        .filter((request) => this.isVisibleToStaff(request))
        .map((request) => ({
          ...request,
          processingMode: this.getProcessingMode(request),
        })),
    );
  }

  async createRequest(
    studentId: string | undefined,
    dto: CreateSwapRequestDto,
  ) {
    const resolvedStudentId = this.requireStudentId(studentId);

    const enrollments =
      await this.studentCourseRepo.findByStudent(resolvedStudentId);
    if (!enrollments.some((e) => e.courseId === dto.courseId)) {
      throw new BadRequestException('Student not enrolled in this course');
    }

    const existing =
      await this.swapRequestRepo.findByStudent(resolvedStudentId);
    const hasPending = existing.some(
      (r) =>
        r.courseId === dto.courseId &&
        r.sessionTypeId === dto.sessionTypeId &&
        r.status === SwapRequestStatus.PENDING,
    );
    if (hasPending) {
      throw new ConflictException(
        'Already has pending request for this session type',
      );
    }

    const desiredGroup = await this.groupRepo.findById(dto.desiredGroupId);
    if (!desiredGroup) throw new NotFoundException('Desired group not found');

    const currentGroup = await this.groupRepo.findById(dto.currentGroupId);
    if (!currentGroup) {
      throw new NotFoundException('Current group not found');
    }

    const [currentSessionType, desiredSessionType] = await Promise.all([
      this.sessionTypeRepo.findById(currentGroup.sessionTypeId),
      this.sessionTypeRepo.findById(desiredGroup.sessionTypeId),
    ]);

    if (!currentSessionType || !desiredSessionType) {
      throw new BadRequestException('Session type metadata is missing');
    }

    if (
      currentSessionType.courseId !== dto.courseId ||
      desiredSessionType.courseId !== dto.courseId
    ) {
      throw new BadRequestException(
        'Groups must belong to the selected course',
      );
    }

    const sameSessionKind = currentSessionType.type === desiredSessionType.type;
    if (!sameSessionKind) {
      const kindLabel = (kind: SessionKind) =>
        kind === SessionKind.LAB ? 'LAB' : 'EXERCISE';

      throw new BadRequestException(
        `Swap across session types is not allowed (${kindLabel(currentSessionType.type)} -> ${kindLabel(desiredSessionType.type)})`,
      );
    }

    if (dto.sessionTypeId !== desiredGroup.sessionTypeId) {
      throw new BadRequestException(
        'Selected session type does not match desired group session type',
      );
    }

    const requestType =
      dto.requestType ??
      (dto.partnerEmail ? SwapRequestType.PAIRED : SwapRequestType.SOLO);

    const partnerEmail = this.normalizeEmail(dto.partnerEmail);
    let partnerStudentId: string | undefined;

    if (requestType === SwapRequestType.PAIRED) {
      if (!partnerEmail) {
        throw new BadRequestException(
          'Partner email is required for paired swap',
        );
      }

      const student = await this.userRepo.findById(resolvedStudentId);
      if (!student) {
        throw new NotFoundException('Student not found');
      }

      if (this.normalizeEmail(student.email) === partnerEmail) {
        throw new BadRequestException(
          'Partner email must be different from requester',
        );
      }

      const partner = await this.userRepo.findByEmail(partnerEmail);
      if (!partner || partner.role !== UserRole.STUDENT) {
        throw new NotFoundException('Partner student not found');
      }

      const partnerEnrollments = await this.studentCourseRepo.findByStudent(
        partner.id,
      );
      const partnerOnCourse = partnerEnrollments.some(
        (entry) => entry.courseId === dto.courseId,
      );

      if (!partnerOnCourse) {
        throw new BadRequestException(
          'Partner student is not enrolled in this course',
        );
      }

      partnerStudentId = partner.id;
    }

    const hasCapacity = await this.groupRepo.hasCapacity(dto.desiredGroupId);
    if (!hasCapacity && requestType === SwapRequestType.SOLO) {
      throw new BadRequestException('Desired group is full');
    }

    const previousAttempts = existing.filter(
      (r) =>
        r.sessionTypeId === dto.sessionTypeId &&
        r.status === SwapRequestStatus.REJECTED,
    ).length;

    const mockGpa = Math.random() * 3 + 2;
    const priorityScore =
      0 * 0.4 +
      (mockGpa / 5.0) * 0.3 +
      (Math.min(previousAttempts, 5) / 5) * 0.3;

    const request = await this.swapRequestRepo.create({
      studentId: resolvedStudentId,
      partnerStudentId,
      courseId: dto.courseId,
      sessionTypeId: dto.sessionTypeId,
      currentGroupId: dto.currentGroupId,
      desiredGroupId: dto.desiredGroupId,
      secondChoiceGroupId: dto.secondChoiceGroupId,
      requestType,
      reason: dto.reason,
      partnerEmail: partnerEmail || undefined,
      partnerConfirmed: requestType === SwapRequestType.SOLO,
      status: SwapRequestStatus.PENDING,
      priorityScore,
      satisfiedWish: undefined,
    });

    await this.tryAutoProcess(request.id);
    const enriched = await this.enrichSwapRequestWithStudent(request);
    return {
      ...enriched,
      processingMode: this.getProcessingMode(enriched),
    };
  }

  async confirmPartner(requestId: string, studentId?: string) {
    const resolvedStudentId = this.requireStudentId(studentId);
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Request is no longer pending');
    }

    if (request.requestType !== SwapRequestType.PAIRED) {
      throw new BadRequestException(
        'Only paired requests require confirmation',
      );
    }

    const partner = await this.userRepo.findById(resolvedStudentId);
    if (!partner) {
      throw new NotFoundException('Student not found');
    }

    if (
      this.normalizeEmail(request.partnerEmail) !==
      this.normalizeEmail(partner.email)
    ) {
      throw new BadRequestException(
        'Only invited partner can confirm this request',
      );
    }

    await this.swapRequestRepo.update(requestId, {
      partnerConfirmed: true,
      partnerStudentId: resolvedStudentId,
    });
    await this.tryAutoProcess(requestId);
    return { message: 'Partner confirmed' };
  }

  async declinePartner(requestId: string, studentId?: string) {
    const resolvedStudentId = this.requireStudentId(studentId);
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Request is no longer pending');
    }

    if (request.requestType !== SwapRequestType.PAIRED) {
      throw new BadRequestException(
        'Only paired requests support partner decline',
      );
    }

    if (request.partnerConfirmed) {
      throw new BadRequestException('Request is already partner-confirmed');
    }

    const partner = await this.userRepo.findById(resolvedStudentId);
    if (!partner) {
      throw new NotFoundException('Student not found');
    }

    if (
      this.normalizeEmail(request.partnerEmail) !==
      this.normalizeEmail(partner.email)
    ) {
      throw new BadRequestException(
        'Only invited partner can decline this request',
      );
    }

    const updated = await this.swapRequestRepo.update(requestId, {
      status: SwapRequestStatus.REJECTED,
      satisfiedWish: false,
      reason: 'Partner declined the swap request',
    });

    return this.enrichSwapRequestWithStudent(updated);
  }

  async getCourseRequests(
    courseId: string | undefined,
    mode: SwapMode,
    professorId?: string,
  ) {
    let allowedCourseIds: string[] | null = null;
    if (professorId) {
      const professorCourses = await this.courseRepo.findMany({
        where: { professorId },
      });
      allowedCourseIds = professorCourses.map((course) => course.id);

      if (courseId && !allowedCourseIds.includes(courseId)) {
        throw new ForbiddenException('Course is not assigned to professor');
      }
    }

    const requests: SwapRequest[] = courseId
      ? await this.swapRequestRepo.findByCourse(courseId)
      : await this.swapRequestRepo.findMany();

    const scopedRequests =
      allowedCourseIds === null
        ? requests
        : requests.filter((request) =>
            allowedCourseIds.includes(request.courseId),
          );

    const visibleRequests = this.dedupeStaffCards(
      scopedRequests.filter((request) => this.isVisibleToStaff(request)),
    );

    let filtered: SwapRequest[] = [];
    if (mode === SwapMode.MANUAL) {
      filtered = visibleRequests.filter(
        (request) => request.status !== SwapRequestStatus.AUTO_RESOLVED,
      );
    } else if (mode === SwapMode.SEMI_AUTO) {
      filtered = visibleRequests.filter(
        (request) =>
          request.requestType === SwapRequestType.PAIRED &&
          request.status === SwapRequestStatus.PENDING &&
          !request.partnerConfirmed,
      );
    } else {
      filtered = visibleRequests.filter(
        (request) => request.status === SwapRequestStatus.AUTO_RESOLVED,
      );
    }

    const enriched = await Promise.all(
      filtered.map((request) => this.enrichSwapRequestWithStudent(request)),
    );

    return enriched.map((request) => ({
      ...request,
      processingMode: this.getProcessingMode(request),
    }));
  }

  async approveRequest(requestId: string) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.status === SwapRequestStatus.AUTO_RESOLVED) {
      throw new BadRequestException(
        'Automatically resolved request cannot change status',
      );
    }

    if (request.status === SwapRequestStatus.APPROVED) {
      return this.enrichSwapRequestWithStudent(request);
    }

    const shouldExecuteSwap =
      request.status === SwapRequestStatus.PENDING || !request.satisfiedWish;

    if (shouldExecuteSwap) {
      if (request.requestType === SwapRequestType.PAIRED) {
        if (!request.partnerConfirmed) {
          throw new BadRequestException(
            'Paired request is waiting for partner confirmation',
          );
        }
        await this.executePairedSwap(request);
      } else {
        const hasCapacity = await this.groupRepo.hasCapacity(
          request.desiredGroupId,
        );
        if (!hasCapacity)
          throw new BadRequestException('Desired group is full');

        await this.executeSwap(
          request.studentId,
          request.currentGroupId,
          request.desiredGroupId,
        );
      }
    }

    const updated = await this.swapRequestRepo.update(requestId, {
      status: SwapRequestStatus.APPROVED,
      satisfiedWish: true,
    });

    return this.enrichSwapRequestWithStudent(updated);
  }

  async rejectRequest(requestId: string, dto: RejectSwapRequestDto) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.status === SwapRequestStatus.AUTO_RESOLVED) {
      throw new BadRequestException(
        'Automatically resolved request cannot change status',
      );
    }

    if (request.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    const updated = await this.swapRequestRepo.update(requestId, {
      status: SwapRequestStatus.REJECTED,
      satisfiedWish: false,
      reason: dto.reason ?? request.reason,
    });

    return this.enrichSwapRequestWithStudent(updated);
  }

  async tryAutoProcess(requestId: string) {
    const request = await this.swapRequestRepo.findById(requestId);
    if (!request || request.status !== SwapRequestStatus.PENDING) return;

    if (
      request.requestType !== SwapRequestType.PAIRED ||
      !request.partnerConfirmed
    ) {
      return;
    }

    const course = await this.courseRepo.findById(request.courseId);
    if (course?.swapMode !== SwapMode.AUTO) {
      return;
    }

    await this.executePairedSwap(request);

    await this.swapRequestRepo.update(request.id, {
      status: SwapRequestStatus.AUTO_RESOLVED,
      satisfiedWish: true,
    });
  }

  private async resolvePartnerStudentId(request: SwapRequest) {
    if (request.partnerStudentId) {
      return request.partnerStudentId;
    }

    if (!request.partnerEmail) {
      throw new BadRequestException('Paired request is missing partner email');
    }

    const partner = await this.userRepo.findByEmail(request.partnerEmail);
    if (!partner || partner.role !== UserRole.STUDENT) {
      throw new NotFoundException('Partner student not found');
    }

    return partner.id;
  }

  private async executePairedSwap(request: SwapRequest) {
    const partnerStudentId = await this.resolvePartnerStudentId(request);
    const partnerGroups =
      await this.studentGroupRepo.findByStudent(partnerStudentId);
    const partnerCurrentGroup = partnerGroups.find(
      (group) => group.groupId === request.desiredGroupId,
    );

    if (!partnerCurrentGroup) {
      throw new BadRequestException(
        'Partner is not assigned to the desired group',
      );
    }

    await this.executeSwap(
      request.studentId,
      request.currentGroupId,
      request.desiredGroupId,
    );

    await this.executeSwap(
      partnerStudentId,
      request.desiredGroupId,
      request.currentGroupId,
    );
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
