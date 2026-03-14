import request from 'supertest';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';

describe('app module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('GET / should return hello world', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/');

    expect(res.status).toBe(200);
    expect(typeof res.text).toBe('string');
  });
});
