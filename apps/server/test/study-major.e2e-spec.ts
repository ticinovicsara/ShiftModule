import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

describe('study-major module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /admin/study-majors should support happy + 401 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/study-majors')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get(
      '/admin/study-majors',
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/study-majors')
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(200);
  });

  it('GET /admin/study-majors/:id should support happy + 401 + 404 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get(`/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .get(`/admin/study-majors/${seedIds.notFound.studyMajor}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).get(
      `/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get(`/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`)
      .set(authHeader(UserRole.PROFESSOR));
    expect(wrongRole.status).toBe(200);
  });

  it('POST /admin/study-majors should support happy + 401 + 400 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post('/admin/study-majors')
      .set(authHeader(UserRole.ADMIN))
      .send({ title: `Major ${Date.now()}`, year: 2 });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post('/admin/study-majors')
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"title":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer())
      .post('/admin/study-majors')
      .send({});
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/admin/study-majors')
      .set(authHeader(UserRole.STUDENT))
      .send({});
    expect(wrongRole.status).toBe(201);
  });

  it('PATCH /admin/study-majors/:id should support happy + 401 + 400 + 404 + current role behavior', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ title: 'Updated major' });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .patch(`/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"title":');
    expect(badBody.status).toBe(400);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/admin/study-majors/${seedIds.notFound.studyMajor}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ title: 'x' });
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ title: 'x' });
    expect(wrongRole.status).toBe(200);
  });

  it('DELETE /admin/study-majors/:id should support happy + 401 + 404 + current role behavior', async () => {
    const created = await request(ctx.app.getHttpServer())
      .post('/admin/study-majors')
      .set(authHeader(UserRole.ADMIN))
      .send({ title: `Delete major ${Date.now()}`, year: 3 });

    const ok = await request(ctx.app.getHttpServer())
      .delete(`/admin/study-majors/${created.body.data.id}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .delete(`/admin/study-majors/${seedIds.notFound.studyMajor}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).delete(
      `/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .delete(`/admin/study-majors/${seedIds.studyMajors.racunarstvo1}`)
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(200);
  });
});
