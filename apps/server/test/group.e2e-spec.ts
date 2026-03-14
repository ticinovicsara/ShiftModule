import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';
import { seedIds } from './helpers/seed-ids';
import { expectEnvelope } from './helpers/assert-envelope';

describe('group module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET /admin/groups should support happy + 401 + 403', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .get('/admin/groups')
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const noToken = await request(ctx.app.getHttpServer()).get('/admin/groups');
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .get('/admin/groups')
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /admin/groups should support happy + 401 + 403 + 400', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post('/admin/groups')
      .set(authHeader(UserRole.ADMIN))
      .send({
        name: `LABX-${Date.now()}`,
        capacity: 10,
        activityTypeId: seedIds.activityTypes.lab,
      });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post('/admin/groups')
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"name":');
    expect(badBody.status).toBe(400);

    const noToken = await request(ctx.app.getHttpServer())
      .post('/admin/groups')
      .send({});
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post('/admin/groups')
      .set(authHeader(UserRole.PROFESSOR))
      .send({});
    expect(wrongRole.status).toBe(403);
  });

  it('PATCH /admin/groups/:id/capacity should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.groups.lab1}/capacity`)
      .set(authHeader(UserRole.ADMIN))
      .send({ capacity: 25 });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const badRequest = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.groups.lab1}/capacity`)
      .set(authHeader(UserRole.ADMIN))
      .send({ capacity: -1 });
    expect(badRequest.status).toBe(400);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.notFound.group}/capacity`)
      .set(authHeader(UserRole.ADMIN))
      .send({ capacity: 10 });
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/admin/groups/${seedIds.groups.lab1}/capacity`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.groups.lab1}/capacity`)
      .set(authHeader(UserRole.STUDENT))
      .send({ capacity: 10 });
    expect(wrongRole.status).toBe(403);
  });

  it('PATCH /admin/groups/:id should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.groups.lab2}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ name: 'LAB2-UPDATED' });
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.groups.lab2}`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"name":');
    expect(badBody.status).toBe(400);

    const notFound = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.notFound.group}`)
      .set(authHeader(UserRole.ADMIN))
      .send({ name: 'x' });
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).patch(
      `/admin/groups/${seedIds.groups.lab2}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .patch(`/admin/groups/${seedIds.groups.lab2}`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ name: 'x' });
    expect(wrongRole.status).toBe(403);
  });

  it('DELETE /admin/groups/:id should support happy + 401 + 403 + 404', async () => {
    const created = await request(ctx.app.getHttpServer())
      .post('/admin/groups')
      .set(authHeader(UserRole.ADMIN))
      .send({
        name: `TMP-${Date.now()}`,
        capacity: 10,
        activityTypeId: seedIds.activityTypes.lab,
      });

    const ok = await request(ctx.app.getHttpServer())
      .delete(`/admin/groups/${created.body.data.id}`)
      .set(authHeader(UserRole.ADMIN));
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);

    const notFound = await request(ctx.app.getHttpServer())
      .delete(`/admin/groups/${seedIds.notFound.group}`)
      .set(authHeader(UserRole.ADMIN));
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).delete(
      `/admin/groups/${seedIds.groups.lab1}`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .delete(`/admin/groups/${seedIds.groups.lab1}`)
      .set(authHeader(UserRole.STUDENT));
    expect(wrongRole.status).toBe(403);
  });

  it('POST /groups/:id/report-issue should support happy + 401 + 403 + 400 + 404', async () => {
    const ok = await request(ctx.app.getHttpServer())
      .post(`/groups/${seedIds.groups.lab1}/report-issue`)
      .set(authHeader(UserRole.PROFESSOR))
      .send({ reason: 'OTHER', description: 'Projector not working' });
    expect(ok.status).toBe(201);
    expectEnvelope(ok.body);

    const badBody = await request(ctx.app.getHttpServer())
      .post(`/groups/${seedIds.groups.lab1}/report-issue`)
      .set(authHeader(UserRole.ADMIN))
      .set('Content-Type', 'application/json')
      .send('{"reason":');
    expect(badBody.status).toBe(400);

    const notFound = await request(ctx.app.getHttpServer())
      .post(`/groups/${seedIds.notFound.group}/report-issue`)
      .set(authHeader(UserRole.ADMIN))
      .send({ reason: 'OTHER', description: 'x' });
    expect(notFound.status).toBe(404);

    const noToken = await request(ctx.app.getHttpServer()).post(
      `/groups/${seedIds.groups.lab1}/report-issue`,
    );
    expect(noToken.status).toBe(401);

    const wrongRole = await request(ctx.app.getHttpServer())
      .post(`/groups/${seedIds.groups.lab1}/report-issue`)
      .set(authHeader(UserRole.STUDENT))
      .send({ reason: 'OTHER', description: 'x' });
    expect(wrongRole.status).toBe(403);
  });
});
