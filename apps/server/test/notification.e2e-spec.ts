import request from 'supertest';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';

describe('notification module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('should be loaded in app module (unknown route returns 404)', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/notification');
    expect(res.status).toBe(404);
  });
});
