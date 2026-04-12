import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { NotificationService } from '../notification/notification.service';
import {
  SessionKind,
  SwapMode,
  SwapRequest,
  SwapRequestStatus,
  SwapRequestType,
  UserRole,
} from '@repo/types';
import { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import { RejectSwapRequestDto } from './dto/reject-swap-request.dto';
import type { UpdateSwapRequestDto } from './dto/update-swap-request.dto';
import type {
  ISwapRequestRepository,
  IStudentGroupRepository,
  IGroupRepository,
  ISessionTypeRepository,
  IStudentCourseRepository,
  ICourseRepository,
  IUserRepository,
} from 'src/repositories';
import {
  calculatePriorityScore as calculatePriorityScoreHelper,
  getGpaWithFallback as getGpaWithFallbackHelper,
} from './helpers/priority.helper';
import {
  findReciprocalPairedMatch as findReciprocalPairedMatchHelper,
  findReciprocalSoloMatch as findReciprocalSoloMatchHelper,
} from './helpers/matching.helper';
import {
  dedupeStaffCards as dedupeStaffCardsHelper,
  getCreateRequestLifecycle,
  getProcessingMode as getProcessingModeHelper,
  getStudentViewState as getStudentViewStateHelper,
  isMatchDeadlinePassed as isMatchDeadlinePassedHelper,
  isVisibleToStaff as isVisibleToStaffHelper,
} from './helpers/status.helper';
import {
  areSessionKindsCompatible,
  areSessionTypesFromCourse,
  countRejectedAttemptsForSession,
  deriveRequestType,
  hasPendingRequestForSession,
  isStudentEnrolledInCourse,
} from './helpers/validation.helper';

@Injectable()
export class SwapRequestService {
  private readonly lockTails = new Map<string, Promise<void>>();
  private readonly heldLocksContext = new AsyncLocalStorage<Set<string>>();

  constructor(
    @Inject('ISwapRequestRepository')
    private readonly swapRequestRepo: ISwapRequestRepository,
    @Inject('IStudentGroupRepository')
    private readonly studentGroupRepo: IStudentGroupRepository,
    @Inject('IGroupRepository')
    private readonly groupRepo: IGroupRepository,
    @Inject('ISessionTypeRepository')
    private readonly sessionTypeRepo: ISessionTypeRepository,
    @Inject('IStudentCourseRepository')
    private readonly studentCourseRepo: IStudentCourseRepository,
    @Inject('ICourseRepository')
    private readonly courseRepo: ICourseRepository,
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    private readonly notificationService: NotificationService,
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

  private async withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
    const heldLocks = this.heldLocksContext.getStore();
    if (heldLocks?.has(key)) {
      return task();
    }

    const previousTail = this.lockTails.get(key) ?? Promise.resolve();

    let releaseCurrent!: () => void;
    const currentGate = new Promise<void>((resolve) => {
      releaseCurrent = resolve;
    });

    const currentTail = previousTail.then(() => currentGate);
    this.lockTails.set(key, currentTail);

    await previousTail;
    try {
      const nextHeldLocks = new Set(heldLocks ?? []);
      nextHeldLocks.add(key);
      return await this.heldLocksContext.run(nextHeldLocks, task);
    } finally {
      releaseCurrent();
      if (this.lockTails.get(key) === currentTail) {
        this.lockTails.delete(key);
      }
    }
  }

  private async withLocks<T>(keys: string[], task: () => Promise<T>) {
    const orderedKeys = Array.from(new Set(keys)).sort();

    const execute = async (index: number): Promise<T> => {
      if (index >= orderedKeys.length) {
        return task();
      }

      return this.withLock(orderedKeys[index], () => execute(index + 1));
    };

    return execute(0);
  }

  private async findReciprocalSoloMatch(
    request: SwapRequest,
  ): Promise<SwapRequest | null> {
    const candidates = await this.swapRequestRepo.findMany({
      where: {
        courseId: request.courseId,
        sessionTypeId: request.sessionTypeId,
        requestType: SwapRequestType.SOLO,
      },
    });

    return findReciprocalSoloMatchHelper(
      request,
      candidates,
    ) as SwapRequest | null;
  }

  private async findReciprocalPairedMatch(
    request: SwapRequest,
    confirmingStudentId: string,
  ): Promise<SwapRequest | null> {
    const candidates = await this.swapRequestRepo.findMany({
      where: {
        courseId: request.courseId,
        sessionTypeId: request.sessionTypeId,
        requestType: SwapRequestType.PAIRED,
      },
    });

    return findReciprocalPairedMatchHelper(
      request,
      confirmingStudentId,
      candidates,
    ) as SwapRequest | null;
  }

  private async finalizePairedReciprocalAutoMatch(
    request: SwapRequest,
    reciprocalRequest: SwapRequest,
    confirmingStudentId: string,
  ) {
    await this.executeSwap(
      request.studentId,
      request.currentGroupId,
      request.desiredGroupId,
    );

    await this.executeSwap(
      reciprocalRequest.studentId,
      reciprocalRequest.currentGroupId,
      reciprocalRequest.desiredGroupId,
    );

    const [updatedPrimary, updatedReciprocal] = await Promise.all([
      this.swapRequestRepo.update(request.id, {
        status: SwapRequestStatus.AUTO_RESOLVED,
        satisfiedWish: true,
        partnerConfirmed: true,
        partnerStudentId: confirmingStudentId,
      }),
      this.swapRequestRepo.update(reciprocalRequest.id, {
        status: SwapRequestStatus.AUTO_RESOLVED,
        satisfiedWish: true,
        partnerConfirmed: true,
        partnerStudentId: request.studentId,
      }),
    ]);

    const [
      primaryStudent,
      reciprocalStudent,
      primaryDesiredGroup,
      reciprocalDesiredGroup,
    ] = await Promise.all([
      this.userRepo.findById(updatedPrimary.studentId),
      this.userRepo.findById(updatedReciprocal.studentId),
      this.groupRepo.findById(updatedPrimary.desiredGroupId),
      this.groupRepo.findById(updatedReciprocal.desiredGroupId),
    ]);

    if (primaryStudent) {
      await this.notificationService.sendSwapAutoResolved(
        primaryStudent.email,
        primaryDesiredGroup?.name ?? updatedPrimary.desiredGroupId,
      );
    }

    if (reciprocalStudent) {
      await this.notificationService.sendSwapAutoResolved(
        reciprocalStudent.email,
        reciprocalDesiredGroup?.name ?? updatedReciprocal.desiredGroupId,
      );
    }

    return {
      primary: updatedPrimary,
      reciprocal: updatedReciprocal,
    };
  }

  private async finalizeSoloAutoMatch(
    request: SwapRequest,
    matchedRequest: SwapRequest,
  ): Promise<SwapRequest> {
    await this.executeSwap(
      request.studentId,
      request.currentGroupId,
      request.desiredGroupId,
    );
    await this.executeSwap(
      matchedRequest.studentId,
      matchedRequest.currentGroupId,
      matchedRequest.desiredGroupId,
    );

    const [updatedRequest, updatedMatchedRequest] = await Promise.all([
      this.swapRequestRepo.update(request.id, {
        status: SwapRequestStatus.AUTO_RESOLVED,
        satisfiedWish: true,
        matchDeadline: undefined,
      }),
      this.swapRequestRepo.update(matchedRequest.id, {
        status: SwapRequestStatus.AUTO_RESOLVED,
        satisfiedWish: true,
        matchDeadline: undefined,
      }),
    ]);

    const [student, matchedStudent, desiredGroup, matchedDesiredGroup] =
      await Promise.all([
        this.userRepo.findById(updatedRequest.studentId),
        this.userRepo.findById(updatedMatchedRequest.studentId),
        this.groupRepo.findById(updatedRequest.desiredGroupId),
        this.groupRepo.findById(updatedMatchedRequest.desiredGroupId),
      ]);

    if (student) {
      await this.notificationService.sendSwapAutoResolved(
        student.email,
        desiredGroup?.name ?? updatedRequest.desiredGroupId,
      );
    }

    if (matchedStudent) {
      await this.notificationService.sendSwapAutoResolved(
        matchedStudent.email,
        matchedDesiredGroup?.name ?? updatedMatchedRequest.desiredGroupId,
      );
    }

    return updatedRequest;
  }

  private async promoteExpiredWaitingRequests(
    requests: SwapRequest[],
  ): Promise<SwapRequest[]> {
    const now = new Date();
    const promoted = await Promise.all(
      requests.map(async (request) => {
        if (
          request.status !== SwapRequestStatus.WAITING_FOR_MATCH ||
          !isMatchDeadlinePassedHelper(request, now)
        ) {
          return request;
        }

        return this.swapRequestRepo.update(request.id, {
          status: SwapRequestStatus.PENDING,
          matchDeadline: undefined,
        });
      }),
    );

    return promoted;
  }

  private async enrichSwapRequestWithStudent(request: SwapRequest) {
    const [course, currentGroup, desiredGroup, student] = await Promise.all([
      this.courseRepo.findById(request.courseId),
      this.groupRepo.findById(request.currentGroupId),
      this.groupRepo.findById(request.desiredGroupId),
      this.userRepo.findById(request.studentId),
    ]);

    return {
      ...request,
      courseTitle: course?.title,
      currentGroupName: currentGroup?.name,
      desiredGroupName: desiredGroup?.name,
      student: student
        ? {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            gpa: student.gpa,
          }
        : undefined,
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

    const ownRequestKeys = new Set(
      ownRequests
        .filter((r) => r.requestType === SwapRequestType.PAIRED)
        .map((r) => `${r.courseId}__${r.sessionTypeId}`),
    );

    const filteredIncoming = incomingRequests.filter((r) => {
      const hasOwnSameCourseAndSession = ownRequestKeys.has(
        `${r.courseId}__${r.sessionTypeId}`,
      );

      if (!hasOwnSameCourseAndSession) {
        return true;
      }

      // Keep partner-side outcomes visible even when the student also has
      // their own paired request for the same course/session.
      return (
        r.status === SwapRequestStatus.APPROVED ||
        r.status === SwapRequestStatus.REJECTED ||
        r.status === SwapRequestStatus.AUTO_RESOLVED
      );
    });

    const merged = new Map<string, SwapRequest>();
    [...ownRequests, ...filteredIncoming].forEach((request) => {
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
        processingMode: getProcessingModeHelper(request),
        studentViewState: getStudentViewStateHelper(
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

    return dedupeStaffCardsHelper(
      enriched
        .filter((request) => isVisibleToStaffHelper(request))
        .map((request) => ({
          ...request,
          processingMode: getProcessingModeHelper(request),
        })),
    );
  }

  async getPrioritizedRequests(
    courseId: string | undefined,
    sessionTypeId: string | undefined,
  ) {
    if (!courseId || !sessionTypeId) {
      throw new BadRequestException('courseId and sessionTypeId are required');
    }

    const requests = await this.swapRequestRepo.findMany({
      where: {
        courseId,
        sessionTypeId,
      },
    });

    const prioritized = [...requests].sort((a, b) => {
      if (!b.priorityScore || !a.priorityScore) {
        return 0;
      }

      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }

      const createdAtDiff = a.createdAt.getTime() - b.createdAt.getTime();
      if (createdAtDiff !== 0) {
        return createdAtDiff;
      }

      return a.id.localeCompare(b.id);
    });

    const enriched = await Promise.all(
      prioritized.map((request) => this.enrichSwapRequestWithStudent(request)),
    );

    return enriched.map((request) => ({
      ...request,
      processingMode: getProcessingModeHelper(request),
    }));
  }

  private async calculatePriorityScore(params: {
    studentId: string;
    courseId: string;
    sessionTypeId: string;
    createdAt: Date;
    previousAttempts: number;
  }): Promise<number> {
    const activeRequests = (
      await this.swapRequestRepo.findMany({
        where: {
          courseId: params.courseId,
          sessionTypeId: params.sessionTypeId,
        },
      })
    ).filter(
      (request) =>
        request.status === SwapRequestStatus.PENDING ||
        request.status === SwapRequestStatus.WAITING_FOR_MATCH,
    );

    const activeSnapshots = await Promise.all(
      activeRequests.map(async (request) => {
        const [student, studentRequests] = await Promise.all([
          this.userRepo.findById(request.studentId),
          this.swapRequestRepo.findByStudent(request.studentId),
        ]);

        return {
          requestId: request.id,
          gpa: getGpaWithFallbackHelper(student?.gpa),
          createdAt: request.createdAt,
          previousRejectedAttempts: countRejectedAttemptsForSession(
            studentRequests,
            request.sessionTypeId,
          ),
        };
      }),
    );

    const requester = await this.userRepo.findById(params.studentId);

    return calculatePriorityScoreHelper(activeSnapshots, {
      requestId: `incoming-${params.studentId}`,
      gpa: getGpaWithFallbackHelper(requester?.gpa),
      createdAt: params.createdAt,
      previousRejectedAttempts: params.previousAttempts,
    });
  }

  async createRequest(
    studentId: string | undefined,
    dto: CreateSwapRequestDto,
  ) {
    const resolvedStudentId = this.requireStudentId(studentId);
    return this.withLocks(
      [
        `student:${resolvedStudentId}`,
        `course-session:${dto.courseId}:${dto.sessionTypeId}`,
      ],
      async () => {
        const requester = await this.userRepo.findById(resolvedStudentId);
        if (!requester) {
          throw new NotFoundException('Student not found');
        }

        const enrollments =
          await this.studentCourseRepo.findByStudent(resolvedStudentId);
        if (!isStudentEnrolledInCourse(enrollments, dto.courseId)) {
          throw new BadRequestException('Student not enrolled in this course');
        }

        const existing =
          await this.swapRequestRepo.findByStudent(resolvedStudentId);
        const hasPending = hasPendingRequestForSession(
          existing,
          dto.courseId,
          dto.sessionTypeId,
        );
        if (hasPending) {
          throw new ConflictException(
            'Already has pending request for this session type',
          );
        }

        const desiredGroup = await this.groupRepo.findById(dto.desiredGroupId);
        if (!desiredGroup)
          throw new NotFoundException('Desired group not found');

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
          !areSessionTypesFromCourse(
            currentSessionType,
            desiredSessionType,
            dto.courseId,
          )
        ) {
          throw new BadRequestException(
            'Groups must belong to the selected course',
          );
        }

        if (
          !areSessionKindsCompatible(currentSessionType, desiredSessionType)
        ) {
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

        const requestType = deriveRequestType(
          dto.requestType,
          dto.partnerEmail,
        );

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

        const hasCapacity = await this.groupRepo.hasCapacity(
          dto.desiredGroupId,
        );
        if (!hasCapacity && requestType === SwapRequestType.SOLO) {
          throw new BadRequestException('Desired group is full');
        }

        const previousAttempts = countRejectedAttemptsForSession(
          existing,
          dto.sessionTypeId,
        );

        const priorityScore = await this.calculatePriorityScore({
          studentId: resolvedStudentId,
          courseId: dto.courseId,
          sessionTypeId: dto.sessionTypeId,
          createdAt: new Date(),
          previousAttempts,
        });

        const requestLifecycle = getCreateRequestLifecycle(
          requestType,
          new Date(),
        );

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
          partnerConfirmed: requestLifecycle.partnerConfirmed,
          status: requestLifecycle.status,
          priorityScore,
          satisfiedWish: undefined,
          matchDeadline: requestLifecycle.matchDeadline,
        });

        if (requestType === SwapRequestType.SOLO) {
          const matchedRequest = await this.findReciprocalSoloMatch(request);
          if (matchedRequest) {
            const autoCompleted = await this.finalizeSoloAutoMatch(
              request,
              matchedRequest,
            );
            const enrichedAutoCompleted =
              await this.enrichSwapRequestWithStudent(autoCompleted);
            return {
              ...enrichedAutoCompleted,
              processingMode: getProcessingModeHelper(enrichedAutoCompleted),
            };
          }
        }

        if (requestType === SwapRequestType.PAIRED && partnerEmail) {
          await this.notificationService.sendPartnerSwapRequest(
            partnerEmail,
            request.id,
            currentGroup.name,
            desiredGroup.name,
            `${requester.firstName} ${requester.lastName}`,
          );
        }

        await this.tryAutoProcess(request.id);
        const enriched = await this.enrichSwapRequestWithStudent(request);
        return {
          ...enriched,
          processingMode: getProcessingModeHelper(enriched),
        };
      },
    );
  }

  async confirmPartner(requestId: string, studentId?: string) {
    const resolvedStudentId = this.requireStudentId(studentId);
    return this.withLocks([`request:${requestId}`], async () => {
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

      const confirmedRequest = await this.swapRequestRepo.update(requestId, {
        partnerConfirmed: true,
        partnerStudentId: resolvedStudentId,
      });

      const reciprocalRequest = await this.findReciprocalPairedMatch(
        confirmedRequest,
        resolvedStudentId,
      );

      if (reciprocalRequest) {
        await this.finalizePairedReciprocalAutoMatch(
          confirmedRequest,
          reciprocalRequest,
          resolvedStudentId,
        );

        return { message: 'Partner confirmed and requests auto-resolved' };
      }

      await this.executePairedSwap(confirmedRequest);

      const resolved = await this.swapRequestRepo.update(requestId, {
        status: SwapRequestStatus.AUTO_RESOLVED,
        satisfiedWish: true,
        partnerConfirmed: true,
        partnerStudentId: resolvedStudentId,
      });

      const [requester, desiredGroup, currentGroup] = await Promise.all([
        this.userRepo.findById(resolved.studentId),
        this.groupRepo.findById(resolved.desiredGroupId),
        this.groupRepo.findById(resolved.currentGroupId),
      ]);

      if (requester) {
        await this.notificationService.sendSwapAutoResolved(
          requester.email,
          desiredGroup?.name ?? resolved.desiredGroupId,
        );
      }

      await this.notificationService.sendSwapAutoResolved(
        partner.email,
        currentGroup?.name ?? resolved.currentGroupId,
      );

      return { message: 'Partner confirmed and request auto-resolved' };
    });
  }

  async declinePartner(requestId: string, studentId?: string) {
    const resolvedStudentId = this.requireStudentId(studentId);
    return this.withLocks([`request:${requestId}`], async () => {
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
    });
  }

  async setSatisfaction(
    requestId: string,
    studentId: string | undefined,
    accepted: boolean,
  ) {
    const resolvedStudentId = this.requireStudentId(studentId);
    return this.withLocks([`request:${requestId}`], async () => {
      const request = await this.swapRequestRepo.findById(requestId);
      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.studentId !== resolvedStudentId) {
        throw new ForbiddenException(
          'You can only respond to your own swap request',
        );
      }

      if (
        request.status !== SwapRequestStatus.APPROVED &&
        request.status !== SwapRequestStatus.AUTO_RESOLVED
      ) {
        throw new BadRequestException(
          'Satisfaction can only be set for resolved requests',
        );
      }

      const updated = await this.swapRequestRepo.update(request.id, {
        satisfiedWish: accepted,
      });

      const enriched = await this.enrichSwapRequestWithStudent(updated);
      return {
        ...enriched,
        processingMode: getProcessingModeHelper(enriched),
        studentViewState: getStudentViewStateHelper(
          enriched,
          resolvedStudentId,
          this.normalizeEmail(enriched.student?.email),
        ),
      };
    });
  }

  async cancelRequest(requestId: string, studentId?: string) {
    const resolvedStudentId = this.requireStudentId(studentId);
    return this.withLocks([`request:${requestId}`], async () => {
      const request = await this.swapRequestRepo.findById(requestId);
      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.studentId !== resolvedStudentId) {
        throw new ForbiddenException('You can only cancel your own request');
      }

      if (
        request.status !== SwapRequestStatus.PENDING &&
        request.status !== SwapRequestStatus.WAITING_FOR_MATCH
      ) {
        throw new BadRequestException(
          'Only unresolved requests can be canceled',
        );
      }

      const removed = await this.swapRequestRepo.delete(requestId);
      return this.enrichSwapRequestWithStudent(removed);
    });
  }

  async updateRequest(
    requestId: string,
    studentId: string | undefined,
    dto: UpdateSwapRequestDto,
  ) {
    const resolvedStudentId = this.requireStudentId(studentId);
    return this.withLocks([`request:${requestId}`], async () => {
      const request = await this.swapRequestRepo.findById(requestId);

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.studentId !== resolvedStudentId) {
        throw new ForbiddenException('You can only edit your own request');
      }

      if (
        request.status !== SwapRequestStatus.PENDING &&
        request.status !== SwapRequestStatus.WAITING_FOR_MATCH
      ) {
        throw new BadRequestException('Only unresolved requests can be edited');
      }

      const next: Partial<SwapRequest> = {};

      if (dto.desiredGroupId && dto.desiredGroupId !== request.desiredGroupId) {
        const desiredGroup = await this.groupRepo.findById(dto.desiredGroupId);
        if (!desiredGroup) {
          throw new NotFoundException('Desired group not found');
        }

        const desiredSessionType = await this.sessionTypeRepo.findById(
          desiredGroup.sessionTypeId,
        );

        if (
          !desiredSessionType ||
          desiredSessionType.courseId !== request.courseId
        ) {
          throw new BadRequestException(
            'Desired group must belong to the same course',
          );
        }

        if (desiredGroup.sessionTypeId !== request.sessionTypeId) {
          throw new BadRequestException(
            'Desired group must belong to the same session type',
          );
        }

        if (dto.desiredGroupId === request.currentGroupId) {
          throw new BadRequestException(
            'Desired group must be different from current group',
          );
        }

        next.desiredGroupId = dto.desiredGroupId;
      }

      if (dto.secondChoiceGroupId !== undefined) {
        if (!dto.secondChoiceGroupId) {
          next.secondChoiceGroupId = undefined;
        } else {
          const secondChoiceGroup = await this.groupRepo.findById(
            dto.secondChoiceGroupId,
          );

          if (!secondChoiceGroup) {
            throw new NotFoundException('Second choice group not found');
          }

          const secondChoiceSessionType = await this.sessionTypeRepo.findById(
            secondChoiceGroup.sessionTypeId,
          );

          if (
            !secondChoiceSessionType ||
            secondChoiceSessionType.courseId !== request.courseId
          ) {
            throw new BadRequestException(
              'Second choice group must belong to the same course',
            );
          }

          if (secondChoiceGroup.sessionTypeId !== request.sessionTypeId) {
            throw new BadRequestException(
              'Second choice group must belong to the same session type',
            );
          }

          const effectiveDesiredGroupId =
            next.desiredGroupId ?? request.desiredGroupId;
          if (dto.secondChoiceGroupId === effectiveDesiredGroupId) {
            throw new BadRequestException(
              'Second choice group must be different from desired group',
            );
          }

          if (dto.secondChoiceGroupId === request.currentGroupId) {
            throw new BadRequestException(
              'Second choice group must be different from current group',
            );
          }

          next.secondChoiceGroupId = dto.secondChoiceGroupId;
        }
      }

      if (dto.reason !== undefined) {
        next.reason = dto.reason;
      }

      const normalizedIncomingPartnerEmail = this.normalizeEmail(
        dto.partnerEmail,
      );
      const explicitRequestType = dto.requestType;
      const derivedRequestType =
        explicitRequestType ??
        (dto.partnerEmail !== undefined
          ? normalizedIncomingPartnerEmail
            ? SwapRequestType.PAIRED
            : SwapRequestType.SOLO
          : request.requestType);

      if (derivedRequestType === SwapRequestType.PAIRED) {
        const partnerEmail =
          dto.partnerEmail !== undefined
            ? normalizedIncomingPartnerEmail
            : this.normalizeEmail(request.partnerEmail);

        if (!partnerEmail) {
          throw new BadRequestException(
            'Partner email is required for paired swap',
          );
        }

        const requester = await this.userRepo.findById(resolvedStudentId);
        if (!requester) {
          throw new NotFoundException('Student not found');
        }

        if (this.normalizeEmail(requester.email) === partnerEmail) {
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
          (entry) => entry.courseId === request.courseId,
        );

        if (!partnerOnCourse) {
          throw new BadRequestException(
            'Partner student is not enrolled in this course',
          );
        }

        const lifecycle = getCreateRequestLifecycle(
          SwapRequestType.PAIRED,
          new Date(),
        );

        next.requestType = SwapRequestType.PAIRED;
        next.partnerEmail = partnerEmail;
        next.partnerStudentId = undefined;
        next.partnerConfirmed = lifecycle.partnerConfirmed;
        next.status = lifecycle.status;
        next.matchDeadline = lifecycle.matchDeadline;
      } else {
        const lifecycle = getCreateRequestLifecycle(
          SwapRequestType.SOLO,
          new Date(),
        );

        next.requestType = SwapRequestType.SOLO;
        next.partnerEmail = undefined;
        next.partnerStudentId = undefined;
        next.partnerConfirmed = lifecycle.partnerConfirmed;
        next.status = lifecycle.status;
        next.matchDeadline = lifecycle.matchDeadline;
      }

      const updated = await this.swapRequestRepo.update(requestId, next);

      if (updated.requestType === SwapRequestType.SOLO) {
        const matchedRequest = await this.findReciprocalSoloMatch(updated);
        if (matchedRequest) {
          return this.finalizeSoloAutoMatch(updated, matchedRequest);
        }
      }

      const enriched = await this.enrichSwapRequestWithStudent(updated);
      return {
        ...enriched,
        processingMode: getProcessingModeHelper(enriched),
      };
    });
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

    const hydratedRequests =
      await this.promoteExpiredWaitingRequests(scopedRequests);

    const visibleRequests = dedupeStaffCardsHelper(
      hydratedRequests.filter(
        (request) =>
          request.status !== SwapRequestStatus.WAITING_FOR_MATCH &&
          isVisibleToStaffHelper(request),
      ),
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
      processingMode: getProcessingModeHelper(request),
    }));
  }

  async approveRequest(requestId: string) {
    return this.withLocks([`request:${requestId}`], async () => {
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

      if (request.status !== SwapRequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be approved');
      }

      const shouldExecuteSwap = request.status === SwapRequestStatus.PENDING;

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

      const student = await this.userRepo.findById(updated.studentId);
      if (student) {
        const desiredGroup = await this.groupRepo.findById(
          updated.desiredGroupId,
        );
        await this.notificationService.sendSwapApproved(
          student.email,
          desiredGroup?.name ?? updated.desiredGroupId,
        );
      }

      return this.enrichSwapRequestWithStudent(updated);
    });
  }

  async rejectRequest(requestId: string, dto: RejectSwapRequestDto) {
    return this.withLocks([`request:${requestId}`], async () => {
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

      const student = await this.userRepo.findById(updated.studentId);
      if (student) {
        await this.notificationService.sendSwapRejected(
          student.email,
          updated.reason,
        );
      }

      return this.enrichSwapRequestWithStudent(updated);
    });
  }

  async approveRequests(ids: string[]) {
    const results: Array<{
      id: string;
      status: 'approved' | 'skipped';
      message?: string;
    }> = [];

    for (const id of ids) {
      try {
        await this.approveRequest(id);
        results.push({ id, status: 'approved' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Skipped';
        results.push({ id, status: 'skipped', message });
      }
    }

    return {
      total: ids.length,
      approved: results.filter((item) => item.status === 'approved').length,
      skipped: results.filter((item) => item.status === 'skipped').length,
      results,
    };
  }

  async rejectRequests(ids: string[], dto: RejectSwapRequestDto) {
    const results: Array<{
      id: string;
      status: 'rejected' | 'skipped';
      message?: string;
    }> = [];

    for (const id of ids) {
      try {
        await this.rejectRequest(id, dto);
        results.push({ id, status: 'rejected' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Skipped';
        results.push({ id, status: 'skipped', message });
      }
    }

    return {
      total: ids.length,
      rejected: results.filter((item) => item.status === 'rejected').length,
      skipped: results.filter((item) => item.status === 'skipped').length,
      results,
    };
  }

  async tryAutoProcess(requestId: string) {
    return this.withLocks([`request:${requestId}`], async () => {
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
    return this.withLocks(
      [`student:${studentId}`, `group:${fromGroupId}`, `group:${toGroupId}`],
      async () => {
        const studentGroups =
          await this.studentGroupRepo.findByStudent(studentId);
        const currentGroup = studentGroups.find(
          (group) => group.groupId === fromGroupId,
        );
        if (!currentGroup)
          throw new NotFoundException('Student not in source group');

        await this.studentGroupRepo.update(currentGroup.id, {
          groupId: toGroupId,
        });
        await this.groupRepo.decrementCount(fromGroupId);
        await this.groupRepo.incrementCount(toGroupId);
      },
    );
  }
}
