import request from 'supertest';
import { SwapRequestStatus, UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader, signToken } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

function studentAuthHeader(
  studentId: string,
  email: string,
  firstName: string,
  lastName: string,
) {
  return {
    Authorization: `Bearer ${signToken(UserRole.STUDENT, {
      id: studentId,
      email,
      firstName,
      lastName,
    })}`,
  };
}

describe('swap-request concurrency (e2e)', () => {
  let ctx: E2eAppContext;

  beforeEach(async () => {
    ctx = await createApp();
  });

  afterEach(async () => {
    await closeApp(ctx);
  });

  it('allows only one successful transition when approve and reject run concurrently for the same request', async () => {
    const server = ctx.app.getHttpServer();

    const [approveResult, rejectResult] = await Promise.all([
      request(server)
        .post(
          `/swap-requests/requests/${seedIds.swapRequests.request2}/approve`,
        )
        .set(authHeader(UserRole.PROFESSOR)),
      request(server)
        .post(`/swap-requests/requests/${seedIds.swapRequests.request2}/reject`)
        .set(authHeader(UserRole.PROFESSOR))
        .send({ reason: 'Capacity check in parallel flow' }),
    ]);

    const approveSucceeded = [200, 201].includes(approveResult.status);
    const rejectSucceeded = [200, 201].includes(rejectResult.status);

    expect(Number(approveSucceeded) + Number(rejectSucceeded)).toBe(1);
    expect([approveResult.status, rejectResult.status]).toContain(400);

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
        rejectedReason?: string;
      } | null>;
    }>('ISwapRequestRepository');

    const updated = await swapRequestRepo.findById(
      seedIds.swapRequests.request2,
    );
    expect(updated).not.toBeNull();
    expect([SwapRequestStatus.APPROVED, SwapRequestStatus.REJECTED]).toContain(
      updated!.status,
    );
  });

  it('allows only one successful transition when two rejects run concurrently for the same request', async () => {
    const server = ctx.app.getHttpServer();

    const [firstRejectResult, secondRejectResult] = await Promise.all([
      request(server)
        .post(`/swap-requests/requests/${seedIds.swapRequests.request2}/reject`)
        .set(authHeader(UserRole.PROFESSOR))
        .send({ reason: 'First parallel reject reason' }),
      request(server)
        .post(`/swap-requests/requests/${seedIds.swapRequests.request2}/reject`)
        .set(authHeader(UserRole.PROFESSOR))
        .send({ reason: 'Second parallel reject reason' }),
    ]);

    const firstRejectSucceeded = [200, 201].includes(firstRejectResult.status);
    const secondRejectSucceeded = [200, 201].includes(
      secondRejectResult.status,
    );

    expect(Number(firstRejectSucceeded) + Number(secondRejectSucceeded)).toBe(
      1,
    );
    expect([firstRejectResult.status, secondRejectResult.status]).toContain(
      400,
    );

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
        rejectedReason?: string;
      } | null>;
    }>('ISwapRequestRepository');

    const updated = await swapRequestRepo.findById(
      seedIds.swapRequests.request2,
    );
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe(SwapRequestStatus.REJECTED);
  });

  it('auto-resolves reciprocal swap requests when two students create opposite requests at the same time', async () => {
    const server = ctx.app.getHttpServer();

    const [firstResult, secondResult] = await Promise.all([
      request(server)
        .post('/swap-requests/student/requests')
        .set(authHeader(UserRole.STUDENT))
        .send({
          courseId: seedIds.courses.osnove1,
          sessionTypeId: seedIds.sessionTypes.lab,
          currentGroupId: 'group-osnove-lab-1',
          desiredGroupId: 'group-osnove-lab-2',
          reason: 'Concurrent reciprocal swap request A',
        }),
      request(server)
        .post('/swap-requests/student/requests')
        .set(
          studentAuthHeader(
            seedIds.users.student2,
            'student2@fesb.hr',
            'Student2',
            'Prezime',
          ),
        )
        .send({
          courseId: seedIds.courses.osnove1,
          sessionTypeId: seedIds.sessionTypes.lab,
          currentGroupId: 'group-osnove-lab-2',
          desiredGroupId: 'group-osnove-lab-1',
          reason: 'Concurrent reciprocal swap request B',
        }),
    ]);

    expect([firstResult.status, secondResult.status]).toEqual(
      expect.arrayContaining([201, 201]),
    );
    expectEnvelope(firstResult.body);
    expectEnvelope(secondResult.body);

    const statuses = [
      firstResult.body.data.status,
      secondResult.body.data.status,
    ];

    expect(statuses).toEqual(
      expect.arrayContaining([
        SwapRequestStatus.WAITING_FOR_MATCH,
        SwapRequestStatus.AUTO_RESOLVED,
      ]),
    );

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
      } | null>;
    }>('ISwapRequestRepository');

    const [storedFirst, storedSecond] = await Promise.all([
      swapRequestRepo.findById(firstResult.body.data.id),
      swapRequestRepo.findById(secondResult.body.data.id),
    ]);

    expect(storedFirst?.status).toBe(SwapRequestStatus.AUTO_RESOLVED);
    expect(storedSecond?.status).toBe(SwapRequestStatus.AUTO_RESOLVED);

    const studentGroupRepo = ctx.moduleRef.get<{
      findByStudent: (studentId: string) => Promise<Array<{ groupId: string }>>;
    }>('IStudentGroupRepository');

    const [student1Groups, student2Groups] = await Promise.all([
      studentGroupRepo.findByStudent(seedIds.users.student1),
      studentGroupRepo.findByStudent(seedIds.users.student2),
    ]);

    expect(student1Groups.map((group) => group.groupId)).toContain(
      'group-osnove-lab-2',
    );
    expect(student1Groups.map((group) => group.groupId)).not.toContain(
      'group-osnove-lab-1',
    );
    expect(student2Groups.map((group) => group.groupId)).toContain(
      'group-osnove-lab-1',
    );
    expect(student2Groups.map((group) => group.groupId)).not.toContain(
      'group-osnove-lab-2',
    );
  });

  it('allows only one active request when the same student creates identical requests concurrently', async () => {
    const server = ctx.app.getHttpServer();
    const createPayload = {
      courseId: seedIds.courses.osnove1,
      sessionTypeId: seedIds.sessionTypes.lab,
      currentGroupId: 'group-osnove-lab-1',
      desiredGroupId: 'group-osnove-lab-2',
      reason: 'Concurrent duplicate create attempt',
    };

    const [firstResult, secondResult] = await Promise.all([
      request(server)
        .post('/swap-requests/student/requests')
        .set(authHeader(UserRole.STUDENT))
        .send(createPayload),
      request(server)
        .post('/swap-requests/student/requests')
        .set(authHeader(UserRole.STUDENT))
        .send(createPayload),
    ]);

    const statuses = [firstResult.status, secondResult.status];
    const successCount = statuses.filter((status) =>
      [200, 201].includes(status),
    ).length;
    const conflictCount = statuses.filter((status) => status === 409).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(1);

    const successBody = [firstResult, secondResult].find((result) =>
      [200, 201].includes(result.status),
    )?.body;
    expect(successBody).toBeDefined();
    expectEnvelope(successBody);

    const swapRequestRepo = ctx.moduleRef.get<{
      findByStudent: (studentId: string) => Promise<
        Array<{
          courseId: string;
          sessionTypeId: string;
          status: SwapRequestStatus;
        }>
      >;
    }>('ISwapRequestRepository');

    const requests = await swapRequestRepo.findByStudent(
      seedIds.users.student1,
    );
    const activeRequestsForSession = requests.filter(
      (entry) =>
        entry.courseId === seedIds.courses.osnove1 &&
        entry.sessionTypeId === seedIds.sessionTypes.lab &&
        [
          SwapRequestStatus.PENDING,
          SwapRequestStatus.WAITING_FOR_MATCH,
        ].includes(entry.status),
    );

    expect(activeRequestsForSession).toHaveLength(1);
  });

  it('allows only one successful partner decision when confirm and decline run concurrently', async () => {
    const server = ctx.app.getHttpServer();

    const createPaired = await request(server)
      .post('/swap-requests/student/requests')
      .set(authHeader(UserRole.STUDENT))
      .send({
        courseId: seedIds.courses.osnove1,
        sessionTypeId: seedIds.sessionTypes.lab,
        currentGroupId: 'group-osnove-lab-1',
        desiredGroupId: 'group-osnove-lab-2',
        requestType: 'PAIRED',
        partnerEmail: 'student2@fesb.hr',
        reason: 'Concurrent partner decision race',
      });

    expect([200, 201]).toContain(createPaired.status);
    expectEnvelope(createPaired.body);
    const requestId = createPaired.body.data.id as string;

    const partnerHeader = studentAuthHeader(
      seedIds.users.student2,
      'student2@fesb.hr',
      'Student2',
      'Prezime',
    );

    const [confirmResult, declineResult] = await Promise.all([
      request(server)
        .post(`/swap-requests/student/requests/${requestId}/confirm-partner`)
        .set(partnerHeader),
      request(server)
        .post(`/swap-requests/student/requests/${requestId}/decline-partner`)
        .set(partnerHeader),
    ]);

    const decisionStatuses = [confirmResult.status, declineResult.status];
    const decisionSuccessCount = decisionStatuses.filter((status) =>
      [200, 201].includes(status),
    ).length;
    const decisionFailureCount = decisionStatuses.filter(
      (status) => status === 400,
    ).length;

    expect(decisionSuccessCount).toBe(1);
    expect(decisionFailureCount).toBe(1);

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
      } | null>;
    }>('ISwapRequestRepository');

    const updated = await swapRequestRepo.findById(requestId);
    expect(updated).not.toBeNull();
    expect([
      SwapRequestStatus.AUTO_RESOLVED,
      SwapRequestStatus.REJECTED,
    ]).toContain(updated!.status);
  });

  it('allows only one successful transition when student cancel and professor approve run concurrently', async () => {
    const server = ctx.app.getHttpServer();
    const requestId = seedIds.swapRequests.request2;
    const ownerHeader = studentAuthHeader(
      'user-student-3',
      'student3@fesb.hr',
      'Student3',
      'Prezime',
    );

    const [cancelResult, approveResult] = await Promise.all([
      request(server)
        .delete(`/swap-requests/student/requests/${requestId}`)
        .set(ownerHeader),
      request(server)
        .post(`/swap-requests/requests/${requestId}/approve`)
        .set(authHeader(UserRole.PROFESSOR)),
    ]);

    const successCount = [cancelResult.status, approveResult.status].filter(
      (status) => [200, 201].includes(status),
    ).length;
    const failureCount = [cancelResult.status, approveResult.status].filter(
      (status) => [400, 404].includes(status),
    ).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
      } | null>;
    }>('ISwapRequestRepository');

    const updated = await swapRequestRepo.findById(requestId);
    if (updated) {
      expect(updated.status).toBe(SwapRequestStatus.APPROVED);
    } else {
      expect(updated).toBeNull();
    }
  });

  it('allows only one successful transition when student update and professor reject run concurrently', async () => {
    const server = ctx.app.getHttpServer();
    const requestId = seedIds.swapRequests.request2;
    const ownerHeader = studentAuthHeader(
      'user-student-3',
      'student3@fesb.hr',
      'Student3',
      'Prezime',
    );

    const [updateResult, rejectResult] = await Promise.all([
      request(server)
        .post(`/swap-requests/student/requests/${requestId}/update`)
        .set(ownerHeader)
        .send({ reason: 'Concurrent student update attempt' }),
      request(server)
        .post(`/swap-requests/requests/${requestId}/reject`)
        .set(authHeader(UserRole.PROFESSOR))
        .send({ reason: 'Concurrent professor reject attempt' }),
    ]);

    const successCount = [updateResult.status, rejectResult.status].filter(
      (status) => [200, 201].includes(status),
    ).length;
    const failureCount = [updateResult.status, rejectResult.status].filter(
      (status) => status === 400,
    ).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
      } | null>;
    }>('ISwapRequestRepository');

    const updated = await swapRequestRepo.findById(requestId);
    expect(updated).not.toBeNull();
    expect([
      SwapRequestStatus.REJECTED,
      SwapRequestStatus.WAITING_FOR_MATCH,
      SwapRequestStatus.AUTO_RESOLVED,
    ]).toContain(updated!.status);
  });

  it('ensures overlapping bulk approve and bulk reject cannot both transition the same request', async () => {
    const server = ctx.app.getHttpServer();
    const ids = [seedIds.swapRequests.request2];

    const [bulkApproveResult, bulkRejectResult] = await Promise.all([
      request(server)
        .post('/swap-requests/requests/bulk/approve')
        .set(authHeader(UserRole.PROFESSOR))
        .send({ ids }),
      request(server)
        .post('/swap-requests/requests/bulk/reject')
        .set(authHeader(UserRole.PROFESSOR))
        .send({ ids, reason: 'Concurrent bulk reject path' }),
    ]);

    expect([bulkApproveResult.status, bulkRejectResult.status]).toEqual(
      expect.arrayContaining([201, 201]),
    );
    expectEnvelope(bulkApproveResult.body);
    expectEnvelope(bulkRejectResult.body);

    const approvedCount = Number(bulkApproveResult.body.data.approved ?? 0);
    const rejectedCount = Number(bulkRejectResult.body.data.rejected ?? 0);

    expect(approvedCount + rejectedCount).toBe(1);

    const swapRequestRepo = ctx.moduleRef.get<{
      findById: (id: string) => Promise<{
        status: SwapRequestStatus;
      } | null>;
    }>('ISwapRequestRepository');

    const updated = await swapRequestRepo.findById(
      seedIds.swapRequests.request2,
    );
    expect(updated).not.toBeNull();
    expect([SwapRequestStatus.APPROVED, SwapRequestStatus.REJECTED]).toContain(
      updated!.status,
    );
  });
});
