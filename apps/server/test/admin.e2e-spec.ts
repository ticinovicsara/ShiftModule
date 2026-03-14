import request from 'supertest';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';

describe('admin module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('POST /admin should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).post('/admin').send({});
    expect(res.status).toBe(201);
    expect(typeof res.text).toBe('string');
  });

  it('GET /admin should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/admin');
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('GET /admin/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/admin/1');
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('PATCH /admin/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .patch('/admin/1')
      .send({});
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('DELETE /admin/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).delete('/admin/1');
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });
});
