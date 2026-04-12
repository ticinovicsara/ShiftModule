import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { expectEnvelope } from './helpers/assert-envelope';
import { seedIds } from './helpers/seed-ids';

describe('student module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /student/courses should support happy + 401 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/student/courses')
      .set(authHeader(UserRole.STUDENT));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/student/courses',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/student/courses')
      .set(authHeader(UserRole.ADMIN));
    expect(wrongRole.status).toBe(200);
  });

  it('GET /student/requests should support happy + 401 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/student/requests')
      .set(authHeader(UserRole.STUDENT));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/student/requests',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/student/requests')
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(200);
  });

  it('POST /student/admin/courses/:courseId/students/:studentId/enroll should enroll existing student without group assignment', async () => {
    const alreadyEnrolled = await request(ctx.app.getHttpServer())
      .post(
        `/student/admin/courses/${seedIds.courses.osnove1}/students/${seedIds.users.student1}/enroll`,
      )
      .set(authHeader(UserRole.ADMIN));
    expect(alreadyEnrolled.status).toBe(201);
    expectEnvelope(alreadyEnrolled.body);
    expect(typeof alreadyEnrolled.body.data.alreadyEnrolled).toBe('boolean');

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(
        `/student/admin/courses/${seedIds.courses.osnove1}/students/${seedIds.users.student1}/enroll`,
      )
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /student/admin/courses/:courseId/students/auto-assign should batch assign ungrouped students', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post(
        `/student/admin/courses/${seedIds.courses.osnove1}/students/auto-assign`,
      )
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);
    expect(ok.body.data.courseId).toBe(seedIds.courses.osnove1);
    expect(typeof ok.body.data.createdAssignments).toBe('number');
    expect(typeof ok.body.data.unresolvedCount).toBe('number');

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(
        `/student/admin/courses/${seedIds.courses.osnove1}/students/auto-assign`,
      )
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /student/admin/courses/:courseId/students/:studentId/enroll should serialize concurrent enroll calls for same student', async () => {
    const endpoint = `/student/admin/courses/${seedIds.courses.osnove1}/students/user-student-5/enroll`;

    const [first, second] = await Promise.all([
      request(ctx.app.getHttpServer())
        .post(endpoint)
        .set(authHeader(UserRole.ADMIN)),
      request(ctx.app.getHttpServer())
        .post(endpoint)
        .set(authHeader(UserRole.ADMIN)),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expectEnvelope(first.body);
    expectEnvelope(second.body);

    const outcomes = [
      first.body.data.alreadyEnrolled,
      second.body.data.alreadyEnrolled,
    ].sort();

    expect(outcomes).toEqual([false, true]);
  });

  it('POST /student/admin/courses/:courseId/students/auto-assign should serialize concurrent auto-assign calls for same course', async () => {
    const endpoint = `/student/admin/courses/${seedIds.courses.osnove1}/students/auto-assign`;

    const [first, second] = await Promise.all([
      request(ctx.app.getHttpServer())
        .post(endpoint)
        .set(authHeader(UserRole.ADMIN)),
      request(ctx.app.getHttpServer())
        .post(endpoint)
        .set(authHeader(UserRole.ADMIN)),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expectEnvelope(first.body);
    expectEnvelope(second.body);

    const createdAssignments = [
      first.body.data.createdAssignments,
      second.body.data.createdAssignments,
    ];

    expect(createdAssignments.some((value) => value > 0)).toBe(true);
    expect(createdAssignments.some((value) => value === 0)).toBe(true);

    const unresolvedCounts = [
      first.body.data.unresolvedCount,
      second.body.data.unresolvedCount,
    ];

    expect(unresolvedCounts.every((value) => typeof value === 'number')).toBe(
      true,
    );
  });

  it('POST /student/admin/courses/:courseId/students/import should enroll only existing local students from JSON payload', async () => {
    const payload = [
      [
        {
          ime: 'Ana',
          prezime: 'Student',
          korisnikoime: 'student5@fesb.hr',
          idbroj: '0011223344',
          grupe: null,
        },
        {
          ime: 'Ghost',
          prezime: 'User',
          korisnikoime: 'does-not-exist@fesb.hr',
          idbroj: '9999999999',
          grupe: null,
        },
      ],
    ];

    const ok = await request(ctx.app.getHttpServer())
      .post(`/student/admin/courses/${seedIds.courses.osnove1}/students/import`)
      .set(authHeader(UserRole.ADMIN))
      .send(payload);

    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);
    expect(ok.body.data.courseId).toBe(seedIds.courses.osnove1);
    expect(ok.body.data.processed).toBe(2);
    expect(
      ok.body.data.enrolledCount + ok.body.data.alreadyEnrolledCount,
    ).toBeGreaterThanOrEqual(1);
    expect(ok.body.data.notFoundCount).toBe(1);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(`/student/admin/courses/${seedIds.courses.osnove1}/students/import`)
      .set(authHeader(UserRole.PROFESSOR))
      .send(payload);
    expect(wrongRole.status).toBe(403);
  });
});
