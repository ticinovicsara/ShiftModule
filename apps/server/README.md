# ShiftModule Server

NestJS API for the ShiftModule swap-management prototype.

## Current Runtime

- Global validation uses `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled.
- Swagger is available at `http://localhost:3000/api/docs`.
- CORS defaults to `http://localhost:5173` and is configurable with `CORS_ORIGINS`.
- Auth uses JWT bearer tokens and reads the secret from `JWT_SECRET`.
- Runtime persistence currently uses in-memory mock repositories seeded from `src/repositories/mock/data`.

## Modules

Active business modules:

- `auth`
- `user`
- `study-major`
- `course`
- `group`
- `session-type`
- `student`
- `swap-request`
- `notification`

The `admin` and `professor` folders are routing/controller scaffolds; the domain behavior lives in the modules above.

## Scripts

From `apps/server`:

```bash
pnpm dev
pnpm start:dev
pnpm build
pnpm test
pnpm test:e2e
pnpm test:e2e:concurrency
pnpm test:e2e:full
pnpm test:cov
pnpm prisma:seed
```

## Environment

- `PORT` - server port, default `3000`
- `NODE_ENV` - defaults to `development`
- `JWT_SECRET` - required for login and auth guard verification
- `JWT_EXPIRY` - JWT lifetime, default `1d`
- `CORS_ORIGINS` - comma-separated allowed origins, default `http://localhost:5173`
- `EMAIL_PROVIDER` - `console`, `smtp`, or `sendgrid`, default `console`
- `EMAIL_FROM` - sender address for notifications
- `MOODLE_OAUTH_URL`, `MOODLE_CLIENT_ID`, `MOODLE_CLIENT_SECRET` - optional Moodle integration settings

## Testing Notes

- E2E coverage lives in `apps/server/test`.
- `test/swap-request.concurrency.e2e-spec.ts` exercises simultaneous swap-request transitions and concurrent create flows.
