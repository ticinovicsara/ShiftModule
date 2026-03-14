import request from 'supertest';
import { SessionKind, UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

describe('session-type module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /admin/session-types should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/session-types')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/admin/session-types',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/session-types')
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /admin/session-types/course/:courseId should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get(`/admin/session-types/course/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      `/admin/session-types/course/${seedIds.courses.osnove1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get(`/admin/session-types/course/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /admin/session-types should support happy + 401 + 403 + 400', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post('/admin/session-types')
      .set(authHeader(UserRole.ADMIN))
      .send({ courseId: seedIds.courses.osnove1, type: SessionKind.EXERCISE });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post('/admin/session-types')
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"courseId":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer())
      .post('/admin/session-types')
      .send({});
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/admin/session-types')
      .set(authHeader(UserRole.PROFESSOR))
      .send({});
    expect(wrongRole.status).toBe(403);
  });

  it('PATCH /admin/session-types/:id should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/admin/session-types/${seedIds.sessionTypes.lab}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ type: SessionKind.LAB });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .patch(`/admin/session-types/${seedIds.sessionTypes.lab}`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"type":');
    expect(badBody.status).toBe(400);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/admin/session-types/${seedIds.notFound.sessionType}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ type: SessionKind.LECTURE });
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/admin/session-types/${seedIds.sessionTypes.lab}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/admin/session-types/${seedIds.sessionTypes.lab}`)
      .set(authHeader(UserRole.STUDENT))
      .send({ type: SessionKind.LECTURE });
    expect(wrongRole.status).toBe(403);
  });

  it('DELETE /admin/session-types/:id should support happy + 401 + 403 + 404', async () => {
    const created = await request(ctx.app.getHttpServer())
      .post('/admin/session-types')
      .set(authHeader(UserRole.ADMIN))
      .send({ courseId: seedIds.courses.osnove1, type: SessionKind.EXERCISE });

    const ok = await request(ctx.app.getHttpServer())
      .delete(`/admin/session-types/${created.body.data.id}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .delete(`/admin/session-types/${seedIds.notFound.sessionType}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).delete(
      `/admin/session-types/${seedIds.sessionTypes.lab}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .delete(`/admin/session-types/${seedIds.sessionTypes.lab}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });
});
