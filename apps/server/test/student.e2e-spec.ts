import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { expectEnvelope } from './helpers/assert-envelope';

describe('student module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /student/courses should support happy + 401 + 403', async () => {
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
    expect(wrongRole.status).toBe(403);
  });

  it('GET /student/requests should support happy + 401 + 403', async () => {
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
    expect(wrongRole.status).toBe(403);
  });
});
