import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';

describe('admin module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('POST /admin should be unavailable', async () => {
    const res = await request(ctx.app.getHttpServer()).post('/admin').send({});
    expect(res.status).toBe(404);
  });

  it('GET /admin should enforce auth + admin role', async () => {
    const noToken = await request(ctx.app.getHttpServer()).get('/admin');
    expect(noToken.status).toBe(401);

    const forbidden = await request(ctx.app.getHttpServer())
      .get('/admin')
      .set(authHeader(UserRole.STUDENT));
    expect(forbidden.status).toBe(403);

    const res = await request(ctx.app.getHttpServer())
      .get('/admin')
      .set(authHeader(UserRole.ADMIN));
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('GET /admin/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .get('/admin/1')
      .set(authHeader(UserRole.ADMIN));
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('PATCH /admin/:id should be unavailable', async () => {
    const res = await request(ctx.app.getHttpServer())
      .patch('/admin/1')
      .send({});
    expect(res.status).toBe(404);
  });

  it('DELETE /admin/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .delete('/admin/1')
      .set(authHeader(UserRole.ADMIN));
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });
});
