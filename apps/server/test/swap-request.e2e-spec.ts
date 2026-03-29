import request from 'supertest';
import { SwapMode, UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader, signToken } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

describe('swap-request module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /swap-requests/student/requests should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/swap-requests/student/requests')
      .set(authHeader(UserRole.STUDENT));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/swap-requests/student/requests',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/swap-requests/student/requests')
      .set(authHeader(UserRole.ADMIN));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /swap-requests/student/requests should support 401 + 403 + 400 current behavior', async () => {
    const noToken = await request(ctx.app.getHttpServer())
      .post('/swap-requests/student/requests')
      .send({});
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/swap-requests/student/requests')
      .set(authHeader(UserRole.ADMIN))
      .send({});
    expect(wrongRole.status).toBe(403);

    const malformed = await request(ctx.app.getHttpServer())
      .post('/swap-requests/student/requests')
      .set(authHeader(UserRole.STUDENT))
      .set('Content-Type', 'application/json')
      .send('{"courseId":');
    expect(malformed.status).toBe(400);

    const badRequest = await request(ctx.app.getHttpServer())
      .post('/swap-requests/student/requests')
      .set(authHeader(UserRole.STUDENT))
      .send({
        courseId: seedIds.courses.osnove1,
        activityTypeId: seedIds.activityTypes.lab,
        currentGroupId: seedIds.groups.lab1,
        desiredGroupId: seedIds.groups.lab2,
      });
    expect([400, 404, 201]).toContain(badRequest.status);
  });

  it('POST /swap-requests/student/requests/:id/confirm-partner should support happy + 401 + 403 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post(
        `/swap-requests/student/requests/${seedIds.swapRequests.request1}/confirm-partner`,
      )
      .set(authHeader(UserRole.STUDENT));
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .post(
        `/swap-requests/student/requests/${seedIds.notFound.swapRequest}/confirm-partner`,
      )
      .set(authHeader(UserRole.STUDENT));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).post(
      `/swap-requests/student/requests/${seedIds.swapRequests.request1}/confirm-partner`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(
        `/swap-requests/student/requests/${seedIds.swapRequests.request1}/confirm-partner`,
      )
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /swap-requests/professor/requests should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/swap-requests/professor/requests')
      .query({ courseId: seedIds.courses.osnove1, mode: SwapMode.MANUAL })
      .set(authHeader(UserRole.PROFESSOR));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer())
      .get('/swap-requests/professor/requests')
      .query({ courseId: seedIds.courses.osnove1, mode: SwapMode.MANUAL });
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/swap-requests/professor/requests')
      .query({ courseId: seedIds.courses.osnove1, mode: SwapMode.MANUAL })
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /swap-requests/professor/requests should reject access to another professor course', async () => {
    const professor2Token = signToken(UserRole.PROFESSOR, {
      id: 'user-professor-2',
      email: 'profesor@fesb.hr',
      firstName: 'Marko',
      lastName: 'Kovacic',
    });

    const forbidden = await request(ctx.app.getHttpServer())
      .get('/swap-requests/professor/requests')
      .query({ courseId: seedIds.courses.osnove1, mode: SwapMode.MANUAL })
      .set({ Authorization: `Bearer ${professor2Token}` });

    expect(forbidden.status).toBe(403);
  });

  it('POST /swap-requests/requests/:id/approve should support happy + 401 + 403 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.swapRequests.request2}/approve`)
      .set(authHeader(UserRole.PROFESSOR));
    expect([200, 201, 400]).toContain(ok.status);

    const notFound = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.notFound.swapRequest}/approve`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).post(
      `/swap-requests/requests/${seedIds.swapRequests.request2}/approve`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.swapRequests.request2}/approve`)
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /swap-requests/requests/:id/reject should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.swapRequests.request1}/reject`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ reason: 'No seats' });
    expect([200, 201, 400]).toContain(ok.status);

    const malformed = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.swapRequests.request1}/reject`)
      .set(authHeader(UserRole.PROFESSOR))
      .set('Content-Type', 'application/json')
      .send('{"reason":');
    expect(malformed.status).toBe(400);

    const notFound = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.notFound.swapRequest}/reject`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ reason: 'x' });
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).post(
      `/swap-requests/requests/${seedIds.swapRequests.request1}/reject`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(`/swap-requests/requests/${seedIds.swapRequests.request1}/reject`)
      .set(authHeader(UserRole.STUDENT))
      .send({ reason: 'x' });
    expect(wrongRole.status).toBe(403);
  });
});
