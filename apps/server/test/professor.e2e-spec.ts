import request from 'supertest';
import { UserRole } from '@repo/types';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { authHeader } from './helpers/auth';

describe('professor module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('POST /professors should be unavailable', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/professors')
      .send({});
    expect(res.status).toBe(404);
  });

  it('GET /professors should enforce auth + admin role', async () => {
    const noToken = await request(ctx.app.getHttpServer()).get('/professors');
    expect(noToken.status).toBe(401);

    const forbidden = await request(ctx.app.getHttpServer())
      .get('/professors')
      .set(authHeader(UserRole.STUDENT));
    expect(forbidden.status).toBe(403);

    const res = await request(ctx.app.getHttpServer())
      .get('/professors')
      .set(authHeader(UserRole.ADMIN));
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('GET /professors/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .get('/professors/1')
      .set(authHeader(UserRole.ADMIN));
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('PATCH /professors/:id should be unavailable', async () => {
    const res = await request(ctx.app.getHttpServer())
      .patch('/professors/1')
      .send({});
    expect(res.status).toBe(404);
  });

  it('DELETE /professors/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .delete('/professors/1')
      .set(authHeader(UserRole.ADMIN));
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });
});
