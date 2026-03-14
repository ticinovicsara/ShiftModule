import request from 'supertest';
import { SwapMode, UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

describe('course module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /admin/courses should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/courses')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/admin/courses',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/courses')
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /admin/courses should support happy + 401 + 403 + 400', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post('/admin/courses')
      .set(authHeader(UserRole.ADMIN))
      .send({
        title: `Course ${Date.now()}`,
        studyMajorId: seedIds.studyMajors.racunarstvo1,
      });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post('/admin/courses')
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"title":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer())
      .post('/admin/courses')
      .send({});
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/admin/courses')
      .set(authHeader(UserRole.PROFESSOR))
      .send({});
    expect(wrongRole.status).toBe(403);
  });

  it('PATCH /admin/courses/:id should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/admin/courses/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ title: 'Updated title' });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/admin/courses/${seedIds.notFound.course}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ title: 'x' });
    expect(notFound.status).toBe(404);

    const badBody = await request(ctx.app.getHttpServer())
      .patch(`/admin/courses/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"title":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/admin/courses/${seedIds.courses.osnove1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/admin/courses/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.STUDENT))
      .send({ title: 'x' });
    expect(wrongRole.status).toBe(403);
  });

  it('POST /admin/courses/:id/assign-professor should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post(`/admin/courses/${seedIds.courses.osnove1}/assign-professor`)
      .set(authHeader(UserRole.ADMIN))
      .send({ professorId: seedIds.users.professor });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .post(`/admin/courses/${seedIds.notFound.course}/assign-professor`)
      .set(authHeader(UserRole.ADMIN))
      .send({ professorId: seedIds.users.professor });
    expect(notFound.status).toBe(404);

    const badBody = await request(ctx.app.getHttpServer())
      .post(`/admin/courses/${seedIds.courses.osnove1}/assign-professor`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"professorId":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer()).post(
      `/admin/courses/${seedIds.courses.osnove1}/assign-professor`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(`/admin/courses/${seedIds.courses.osnove1}/assign-professor`)
      .set(authHeader(UserRole.STUDENT))
      .send({ professorId: seedIds.users.professor });
    expect(wrongRole.status).toBe(403);
  });

  it('DELETE /admin/courses/:id should support happy + 401 + 403 + 404', async () => {
    const created = await request(ctx.app.getHttpServer())
      .post('/admin/courses')
      .set(authHeader(UserRole.ADMIN))
      .send({
        title: `Delete me ${Date.now()}`,
        studyMajorId: seedIds.studyMajors.racunarstvo1,
      });

    const ok = await request(ctx.app.getHttpServer())
      .delete(`/admin/courses/${created.body.data.id}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .delete(`/admin/courses/${seedIds.notFound.course}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).delete(
      `/admin/courses/${seedIds.courses.osnove1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .delete(`/admin/courses/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /professor/courses should enforce professor role', async () => {
    const res = await request(ctx.app.getHttpServer())
      .get('/professor/courses')
      .set(authHeader(UserRole.PROFESSOR));
    expect([200, 404]).toContain(res.status);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/professor/courses',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/professor/courses')
      .set(authHeader(UserRole.ADMIN));
    expect(wrongRole.status).toBe(403);
  });

  it('GET /professor/courses/:id should support happy + 401 + 403 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get(`/professor/courses/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .get(`/professor/courses/${seedIds.notFound.course}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).get(
      `/professor/courses/${seedIds.courses.osnove1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get(`/professor/courses/${seedIds.courses.osnove1}`)
      .set(authHeader(UserRole.ADMIN));
    expect(wrongRole.status).toBe(403);
  });

  it('PATCH /professor/courses/:id/swap-mode should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/professor/courses/${seedIds.courses.osnove1}/swap-mode`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ mode: SwapMode.MANUAL });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/professor/courses/${seedIds.notFound.course}/swap-mode`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ mode: SwapMode.AUTO });
    expect(notFound.status).toBe(404);

    const badBody = await request(ctx.app.getHttpServer())
      .patch(`/professor/courses/${seedIds.courses.osnove1}/swap-mode`)
      .set(authHeader(UserRole.PROFESSOR))
      .set('Content-Type', 'application/json')
      .send('{"mode":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/professor/courses/${seedIds.courses.osnove1}/swap-mode`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/professor/courses/${seedIds.courses.osnove1}/swap-mode`)
      .set(authHeader(UserRole.ADMIN))
      .send({ mode: SwapMode.SEMI_AUTO });
    expect(wrongRole.status).toBe(403);
  });
});
