import request from 'supertest';
import { createApp, closeApp, E2eAppContext } from './helpers/create-app';
import { expectEnvelope } from './helpers/assert-envelope';

describe('auth module (e2e)', () => {
  let ctx: E2eAppContext;

  beforeAll(async () => {
    ctx = await createApp();
  });

  afterAll(async () => {
    await closeApp(ctx);
  });

  it('POST /auth/login should login existing mock user', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@fesb.hr', password: 'irrelevant' });

    expect(res.status).toBe(201);
    expectEnvelope(res.body);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('POST /auth/login should return 401 for invalid credentials', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'missing@fesb.hr', password: 'x' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/login should return 400 for malformed JSON', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(res.status).toBe(400);
  });
});
