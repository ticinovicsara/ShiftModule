import { SwapRequestService } from './swap-request.service';
import {
  StudentGroupStatus,
  SwapRequest,
  SwapRequestStatus,
  SwapRequestType,
  User,
  UserRole,
} from '@repo/types';
import type {
  ICourseRepository,
  IGroupRepository,
  ISessionTypeRepository,
  IStudentCourseRepository,
  IStudentGroupRepository,
  ISwapRequestRepository,
  IUserRepository,
} from 'src/repositories';
import { NotificationService } from 'src/notification/notification.service';
import { describe, jest, beforeEach, it, expect } from '@jest/globals';

type PriorityScoreParams = {
  studentId: string;
  courseId: string;
  sessionTypeId: string;
  createdAt: Date;
  previousAttempts: number;
};

describe('SwapRequestService priority scoring and sorting', () => {
  let service: SwapRequestService;

  let swapRequestRepo: jest.Mocked<ISwapRequestRepository>;
  let userRepo: jest.Mocked<IUserRepository>;
  let groupRepo: jest.Mocked<IGroupRepository>;
  let courseRepo: jest.Mocked<ICourseRepository>;
  let studentGroupRepo: jest.Mocked<IStudentGroupRepository>;

  beforeEach(() => {
    swapRequestRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByStudent: jest.fn(),
      findByCourse: jest.fn(),
      findPending: jest.fn(),
      findMatchingRequest: jest.fn(),
    } as unknown as jest.Mocked<ISwapRequestRepository>;

    userRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      findByRole: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    groupRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findBySessionType: jest.fn(),
      findActive: jest.fn(),
      hasCapacity: jest.fn(),
      incrementCount: jest.fn(),
      decrementCount: jest.fn(),
      moveStudent: jest.fn(),
      findByProfessorAndCourse: jest.fn(),
    } as unknown as jest.Mocked<IGroupRepository>;

    courseRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByProfessor: jest.fn(),
      findByStudyMajor: jest.fn(),
      findByProfessorAndStudyMajor: jest.fn(),
      findBySessionTypeAndProfessor: jest.fn(),
    } as unknown as jest.Mocked<ICourseRepository>;

    studentGroupRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByStudent: jest.fn(),
      findByGroup: jest.fn(),
      findByStudentAndCourse: jest.fn(),
      transferStudent: jest.fn(),
      findByProfessorAndCourse: jest.fn(),
      findByStudentAndSessionType: jest.fn(),
    } as unknown as jest.Mocked<IStudentGroupRepository>;

    const sessionTypeRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCourse: jest.fn(),
      findByType: jest.fn(),
      findByProfessor: jest.fn(),
    } as unknown as ISessionTypeRepository;

    const studentCourseRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByStudent: jest.fn(),
      findByCourse: jest.fn(),
      isEnrolled: jest.fn(),
      enrollStudent: jest.fn(),
      unenrollStudent: jest.fn(),
      findByStudentAndProfessor: jest.fn(),
    } as unknown as IStudentCourseRepository;

    const notificationService = {
      sendPartnerSwapRequest: jest.fn(),
      sendSwapApproved: jest.fn(),
      sendSwapRejected: jest.fn(),
      sendSwapAutoResolved: jest.fn(),
      notifyProfessorSwapCompleted: jest.fn(),
    } as unknown as NotificationService;

    service = new SwapRequestService(
      swapRequestRepo,
      studentGroupRepo,
      groupRepo,
      sessionTypeRepo,
      studentCourseRepo,
      courseRepo,
      userRepo,
      notificationService,
    );
  });

  function makeUser(
    id: string,
    firstName: string,
    email: string,
    gpa: number,
  ): User {
    return {
      id,
      firstName,
      lastName: 'Test',
      email,
      role: UserRole.STUDENT,
      gpa,
    };
  }

  function makeSwapRequest(
    id: string,
    studentId: string,
    priorityScore: number,
    createdAt: Date,
    status: SwapRequestStatus = SwapRequestStatus.PENDING,
  ): SwapRequest {
    return {
      id,
      studentId,
      partnerStudentId: undefined,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      currentGroupId: 'group-a',
      desiredGroupId: 'group-b',
      secondChoiceGroupId: undefined,
      requestType: SwapRequestType.SOLO,
      reason: 'Need schedule alignment',
      partnerEmail: undefined,
      partnerConfirmed: true,
      status,
      priorityScore,
      satisfiedWish: undefined,
      matchDeadline: undefined,
      createdAt,
      updatedAt: createdAt,
    };
  }

  async function calculateScore(params: PriorityScoreParams): Promise<number> {
    return (
      service as unknown as {
        calculatePriorityScore: (args: PriorityScoreParams) => Promise<number>;
      }
    ).calculatePriorityScore(params);
  }

  const pause = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  // Proves that with identical submission time and attempts, higher GPA yields higher priority score.
  it('gives ana higher score than marko when ana has higher GPA at same submission time', async () => {
    const petraRequest = makeSwapRequest(
      'request-petra',
      'petra-id',
      0.5,
      new Date('2026-04-01T10:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );

    const ana = makeUser('ana-id', 'Ana', 'ana@student.hr', 4.8);
    const marko = makeUser('marko-id', 'Marko', 'marko@student.hr', 3.0);
    const petra = makeUser('petra-id', 'Petra', 'petra@student.hr', 3.6);

    swapRequestRepo.findMany.mockResolvedValue([petraRequest]);
    swapRequestRepo.findByStudent.mockImplementation(async (studentId) => {
      if (studentId === 'petra-id') {
        return [petraRequest];
      }
      return [];
    });

    userRepo.findById.mockImplementation(async (id) => {
      if (id === ana.id) return ana;
      if (id === marko.id) return marko;
      if (id === petra.id) return petra;
      return null;
    });

    const submissionTime = new Date('2026-04-02T09:00:00.000Z');

    const anaScore = await calculateScore({
      studentId: ana.id,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      createdAt: submissionTime,
      previousAttempts: 0,
    });

    const markoScore = await calculateScore({
      studentId: marko.id,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      createdAt: submissionTime,
      previousAttempts: 0,
    });

    expect(anaScore).toBeGreaterThan(markoScore);
  });

  // Proves that with identical GPA, earlier submission time gets higher priority score.
  it('gives ana higher score than marko when both have same GPA but ana submitted earlier', async () => {
    const petraRequest = makeSwapRequest(
      'request-petra',
      'petra-id',
      0.5,
      new Date('2026-04-02T09:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );
    const ivanRequest = makeSwapRequest(
      'request-ivan',
      'ivan-id',
      0.5,
      new Date('2026-04-02T11:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );

    const ana = makeUser('ana-id', 'Ana', 'ana@student.hr', 4.0);
    const marko = makeUser('marko-id', 'Marko', 'marko@student.hr', 4.0);
    const petra = makeUser('petra-id', 'Petra', 'petra@student.hr', 4.8);
    const ivan = makeUser('ivan-id', 'Ivan', 'ivan@student.hr', 4.6);

    swapRequestRepo.findMany.mockResolvedValue([petraRequest, ivanRequest]);
    swapRequestRepo.findByStudent.mockResolvedValue([]);
    userRepo.findById.mockImplementation(async (id) => {
      if (id === ana.id) return ana;
      if (id === marko.id) return marko;
      if (id === petra.id) return petra;
      if (id === ivan.id) return ivan;
      return null;
    });

    const anaScore = await calculateScore({
      studentId: ana.id,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      createdAt: new Date('2026-04-02T08:00:00.000Z'),
      previousAttempts: 0,
    });

    const markoScore = await calculateScore({
      studentId: marko.id,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      createdAt: new Date('2026-04-02T10:00:00.000Z'),
      previousAttempts: 0,
    });

    expect(anaScore).toBeGreaterThan(markoScore);
  });

  // Proves that with identical GPA and submission time, more previous rejections increase priority score.
  it('gives ana higher score than marko when ana has more previous rejected attempts', async () => {
    const petraRequest = makeSwapRequest(
      'request-petra',
      'petra-id',
      0.5,
      new Date('2026-04-01T10:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );
    const ivanRequest = makeSwapRequest(
      'request-ivan',
      'ivan-id',
      0.5,
      new Date('2026-04-01T10:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );

    const ana = makeUser('ana-id', 'Ana', 'ana@student.hr', 3.9);
    const marko = makeUser('marko-id', 'Marko', 'marko@student.hr', 3.9);
    const petra = makeUser('petra-id', 'Petra', 'petra@student.hr', 3.9);
    const ivan = makeUser('ivan-id', 'Ivan', 'ivan@student.hr', 3.9);

    const petraRejected1 = makeSwapRequest(
      'request-petra-r1',
      'petra-id',
      0.1,
      new Date('2026-03-28T09:00:00.000Z'),
      SwapRequestStatus.REJECTED,
    );
    const petraRejected2 = makeSwapRequest(
      'request-petra-r2',
      'petra-id',
      0.1,
      new Date('2026-03-29T09:00:00.000Z'),
      SwapRequestStatus.REJECTED,
    );
    const ivanRejected1 = makeSwapRequest(
      'request-ivan-r1',
      'ivan-id',
      0.1,
      new Date('2026-03-30T09:00:00.000Z'),
      SwapRequestStatus.REJECTED,
    );

    swapRequestRepo.findMany.mockResolvedValue([petraRequest, ivanRequest]);
    swapRequestRepo.findByStudent.mockImplementation(async (studentId) => {
      if (studentId === 'petra-id') return [petraRejected1, petraRejected2];
      if (studentId === 'ivan-id') return [ivanRejected1];
      return [];
    });
    userRepo.findById.mockImplementation(async (id) => {
      if (id === ana.id) return ana;
      if (id === marko.id) return marko;
      if (id === petra.id) return petra;
      if (id === ivan.id) return ivan;
      return null;
    });

    const submissionTime = new Date('2026-04-02T09:00:00.000Z');

    const anaScore = await calculateScore({
      studentId: ana.id,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      createdAt: submissionTime,
      previousAttempts: 3,
    });

    const markoScore = await calculateScore({
      studentId: marko.id,
      courseId: 'course-1',
      sessionTypeId: 'session-lab',
      createdAt: submissionTime,
      previousAttempts: 0,
    });

    expect(anaScore).toBeGreaterThan(markoScore);
  });

  // Proves getPrioritizedRequests orders by priorityScore descending.
  it('returns prioritized requests sorted by priorityScore descending', async () => {
    const anaRequest = makeSwapRequest(
      'request-ana',
      'ana-id',
      0.9,
      new Date('2026-04-01T10:00:00.000Z'),
    );
    const markoRequest = makeSwapRequest(
      'request-marko',
      'marko-id',
      0.4,
      new Date('2026-04-01T09:00:00.000Z'),
    );
    const petraRequest = makeSwapRequest(
      'request-petra',
      'petra-id',
      0.7,
      new Date('2026-04-01T11:00:00.000Z'),
    );

    swapRequestRepo.findMany.mockResolvedValue([
      markoRequest,
      anaRequest,
      petraRequest,
    ]);

    userRepo.findById.mockImplementation(async (id) => {
      if (id === 'ana-id')
        return makeUser('ana-id', 'Ana', 'ana@student.hr', 4.7);
      if (id === 'marko-id') {
        return makeUser('marko-id', 'Marko', 'marko@student.hr', 3.2);
      }
      if (id === 'petra-id') {
        return makeUser('petra-id', 'Petra', 'petra@student.hr', 4.0);
      }
      return null;
    });

    courseRepo.findById.mockResolvedValue({
      id: 'course-1',
      title: 'Algorithms',
      studyMajorId: 'major-1',
      professorId: 'prof-1',
      swapMode: undefined,
      merlinUrl: undefined,
    });

    groupRepo.findById.mockResolvedValue({
      id: 'group-any',
      name: 'Group A',
      capacity: 30,
      currentCount: 20,
      isActive: true,
      sessionTypeId: 'session-lab',
      schedule: { day: 'Mon', time: '10:00', room: 'A1' },
    });

    const prioritized = await service.getPrioritizedRequests(
      'course-1',
      'session-lab',
    );

    expect(prioritized.map((request) => request.id)).toEqual([
      'request-ana',
      'request-petra',
      'request-marko',
    ]);
  });

  // Proves getPrioritizedRequests uses earlier createdAt as tiebreaker when priorityScore is equal.
  it('uses createdAt ascending as tiebreaker when priorityScore is equal', async () => {
    const anaRequest = makeSwapRequest(
      'request-ana',
      'ana-id',
      0.6,
      new Date('2026-04-01T08:00:00.000Z'),
    );
    const markoRequest = makeSwapRequest(
      'request-marko',
      'marko-id',
      0.6,
      new Date('2026-04-01T10:00:00.000Z'),
    );
    const petraRequest = makeSwapRequest(
      'request-petra',
      'petra-id',
      0.6,
      new Date('2026-04-01T09:00:00.000Z'),
    );

    swapRequestRepo.findMany.mockResolvedValue([
      markoRequest,
      petraRequest,
      anaRequest,
    ]);

    userRepo.findById.mockImplementation(async (id) => {
      if (id === 'ana-id')
        return makeUser('ana-id', 'Ana', 'ana@student.hr', 4.2);
      if (id === 'marko-id') {
        return makeUser('marko-id', 'Marko', 'marko@student.hr', 4.2);
      }
      if (id === 'petra-id') {
        return makeUser('petra-id', 'Petra', 'petra@student.hr', 4.2);
      }
      return null;
    });

    courseRepo.findById.mockResolvedValue({
      id: 'course-1',
      title: 'Algorithms',
      studyMajorId: 'major-1',
      professorId: 'prof-1',
      swapMode: undefined,
      merlinUrl: undefined,
    });

    groupRepo.findById.mockResolvedValue({
      id: 'group-any',
      name: 'Group A',
      capacity: 30,
      currentCount: 20,
      isActive: true,
      sessionTypeId: 'session-lab',
      schedule: { day: 'Mon', time: '10:00', room: 'A1' },
    });

    const prioritized = await service.getPrioritizedRequests(
      'course-1',
      'session-lab',
    );

    expect(prioritized.map((request) => request.id)).toEqual([
      'request-ana',
      'request-petra',
      'request-marko',
    ]);
  });

  // Proves concurrent reject operations on the same request are serialized so only one transition succeeds.
  it('serializes concurrent reject operations on the same request', async () => {
    let requestState = makeSwapRequest(
      'request-petra',
      'petra-id',
      0.5,
      new Date('2026-04-01T09:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );

    swapRequestRepo.findById.mockImplementation(async (id) => {
      if (id !== requestState.id) return null;
      return { ...requestState };
    });

    swapRequestRepo.update.mockImplementation(async (id, data) => {
      if (id !== requestState.id) {
        throw new Error('Request not found');
      }

      // Simulate overlapping write windows; lock orchestration should serialize this.
      await pause(15);
      requestState = {
        ...requestState,
        ...data,
        updatedAt: new Date('2026-04-02T12:00:00.000Z'),
      };
      return { ...requestState };
    });

    userRepo.findById.mockResolvedValue(null);
    courseRepo.findById.mockResolvedValue(null);
    groupRepo.findById.mockResolvedValue(null);

    const [anaResult, markoResult] = await Promise.allSettled([
      service.rejectRequest(requestState.id, { reason: 'Ana review' }),
      service.rejectRequest(requestState.id, { reason: 'Marko review' }),
    ]);

    const fulfilledCount = [anaResult, markoResult].filter(
      (result) => result.status === 'fulfilled',
    ).length;
    const rejectedCount = [anaResult, markoResult].filter(
      (result) => result.status === 'rejected',
    ).length;

    expect(fulfilledCount).toBe(1);
    expect(rejectedCount).toBe(1);
    expect(requestState.status).toBe(SwapRequestStatus.REJECTED);
  });

  // Proves approve and reject racing on the same request cannot both succeed.
  it('prevents approve and reject from both succeeding concurrently', async () => {
    let requestState = makeSwapRequest(
      'request-ana',
      'ana-id',
      0.7,
      new Date('2026-04-01T08:00:00.000Z'),
      SwapRequestStatus.PENDING,
    );

    swapRequestRepo.findById.mockImplementation(async (id) => {
      if (id !== requestState.id) return null;
      return { ...requestState };
    });

    swapRequestRepo.update.mockImplementation(async (id, data) => {
      if (id !== requestState.id) {
        throw new Error('Request not found');
      }

      await pause(15);
      requestState = {
        ...requestState,
        ...data,
        updatedAt: new Date('2026-04-02T12:05:00.000Z'),
      };
      return { ...requestState };
    });

    userRepo.findById.mockResolvedValue(null);
    courseRepo.findById.mockResolvedValue({
      id: 'course-1',
      title: 'Algorithms',
      studyMajorId: 'major-1',
      professorId: 'prof-1',
      swapMode: undefined,
      merlinUrl: undefined,
    });
    groupRepo.hasCapacity.mockResolvedValue(true);
    studentGroupRepo.findByStudent.mockResolvedValue([
      {
        id: 'sg-1',
        studentId: 'ana-id',
        groupId: 'group-a',
        status: StudentGroupStatus.ASSIGNED,
      },
    ]);
    studentGroupRepo.update.mockResolvedValue({
      id: 'sg-1',
      studentId: 'ana-id',
      groupId: 'group-b',
      status: StudentGroupStatus.ASSIGNED,
    });
    groupRepo.decrementCount.mockResolvedValue({
      id: 'group-a',
      name: 'Group A',
      capacity: 30,
      currentCount: 24,
      isActive: true,
      sessionTypeId: 'session-lab',
      schedule: { day: 'Mon', time: '10:00', room: 'A1' },
    });
    groupRepo.incrementCount.mockResolvedValue({
      id: 'group-b',
      name: 'Group B',
      capacity: 30,
      currentCount: 26,
      isActive: true,
      sessionTypeId: 'session-lab',
      schedule: { day: 'Tue', time: '10:00', room: 'B1' },
    });
    groupRepo.findById.mockResolvedValue({
      id: 'group-a',
      name: 'Group A',
      capacity: 30,
      currentCount: 25,
      isActive: true,
      sessionTypeId: 'session-lab',
      schedule: { day: 'Mon', time: '10:00', room: 'A1' },
    });

    const [approveResult, rejectResult] = await Promise.allSettled([
      service.approveRequest(requestState.id),
      service.rejectRequest(requestState.id, { reason: 'Capacity mismatch' }),
    ]);

    const fulfilledCount = [approveResult, rejectResult].filter(
      (result) => result.status === 'fulfilled',
    ).length;
    const rejectedCount = [approveResult, rejectResult].filter(
      (result) => result.status === 'rejected',
    ).length;

    expect(fulfilledCount).toBe(1);
    expect(rejectedCount).toBe(1);
    expect([SwapRequestStatus.APPROVED, SwapRequestStatus.REJECTED]).toContain(
      requestState.status,
    );
  });
});
