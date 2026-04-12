import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

describe('user module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /admin/users should support happy + 401 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/users')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get('/admin/users');
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/users')
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(200);
  });

  it('GET /admin/users?role=STUDENT should support happy + 401 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/users')
      .query({ role: UserRole.STUDENT })
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get('/admin/users');
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/users')
      .query({ role: UserRole.STUDENT })
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(200);
  });

  it('GET /admin/users?role=PROFESSOR should support happy + 401 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/users')
      .query({ role: UserRole.PROFESSOR })
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get('/admin/users');
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/users')
      .query({ role: UserRole.PROFESSOR })
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(200);
  });

  it('GET /admin/users/:id should support happy + 401 + 404 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get(`/admin/users/${seedIds.users.admin}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .get(`/admin/users/${seedIds.notFound.user}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).get(
      `/admin/users/${seedIds.users.admin}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get(`/admin/users/${seedIds.users.admin}`)
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(200);
  });
});
