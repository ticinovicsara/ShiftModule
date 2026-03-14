import request from 'supertest';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';

describe('professor module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('POST /professor should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/professor')
      .send({});
    expect(res.status).toBe(201);
    expect(typeof res.text).toBe('string');
  });

  it('GET /professor should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/professor');
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('GET /professor/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/professor/1');
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('PATCH /professor/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer())
      .patch('/professor/1')
      .send({});
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });

  it('DELETE /professor/:id should return scaffold response', async () => {
    const res = await request(ctx.app.getHttpServer()).delete('/professor/1');
    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });
});
