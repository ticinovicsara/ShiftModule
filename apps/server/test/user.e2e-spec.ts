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

  it('GET /admin/users should support happy + 401 + 403', async () => {
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
    expect(wrongRole.status).toBe(403);
  });

  it('GET /admin/users/students should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/users/students')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/admin/users/students',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/users/students')
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /admin/users/professors should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/users/professors')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/admin/users/professors',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/users/professors')
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /admin/users/:id should support happy + 401 + 403 + 404', async () => {
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
    expect(wrongRole.status).toBe(403);
  });

  it('POST /admin/users should support happy + 401 + 403 + 400', async () => {
    const email = `new-user-${Date.now()}@fesb.hr`;
    const ok = await request(ctx.app.getHttpServer())
      .post('/admin/users')
      .set(authHeader(UserRole.ADMIN))
      .send({
        email,
        firstName: 'New',
        lastName: 'User',
        role: UserRole.STUDENT,
      });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post('/admin/users')
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer())
      .post('/admin/users')
      .send({ email: 'x@x.com' });
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/admin/users')
      .set(authHeader(UserRole.PROFESSOR))
      .send({ email: 'x@x.com' });
    expect(wrongRole.status).toBe(403);
  });

  it('POST /admin/users/import should support happy + 401 + 403 + 400', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post('/admin/users/import')
      .set(authHeader(UserRole.ADMIN))
      .send([
        {
          email: `batch-${Date.now()}-1@fesb.hr`,
          firstName: 'Batch',
          lastName: 'One',
          role: UserRole.STUDENT,
        },
      ]);
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post('/admin/users/import')
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"users":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer())
      .post('/admin/users/import')
      .send([]);
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/admin/users/import')
      .set(authHeader(UserRole.STUDENT))
      .send([]);
    expect(wrongRole.status).toBe(403);
  });

  it('PATCH /admin/users/:id should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/admin/users/${seedIds.users.student1}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ firstName: 'Updated' });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/admin/users/${seedIds.notFound.user}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ firstName: 'X' });
    expect(notFound.status).toBe(404);

    const badBody = await request(ctx.app.getHttpServer())
      .patch(`/admin/users/${seedIds.users.student1}`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"firstName":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/admin/users/${seedIds.users.student1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/admin/users/${seedIds.users.student1}`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ firstName: 'Blocked' });
    expect(wrongRole.status).toBe(403);
  });

  it('DELETE /admin/users/:id should support happy + 401 + 403 + 404', async () => {
    const created = await request(ctx.app.getHttpServer())
      .post('/admin/users')
      .set(authHeader(UserRole.ADMIN))
      .send({
        email: `to-delete-${Date.now()}@fesb.hr`,
        firstName: 'To',
        lastName: 'Delete',
        role: UserRole.STUDENT,
      });

    const ok = await request(ctx.app.getHttpServer())
      .delete(`/admin/users/${created.body.data.id}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .delete(`/admin/users/${seedIds.notFound.user}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).delete(
      `/admin/users/${seedIds.users.student1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .delete(`/admin/users/${seedIds.users.student1}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });
});
