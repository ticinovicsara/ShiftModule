import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export interface E2eAppContext {
  app: INestApplication;
  moduleRef: TestingModule;
}

export async function createApp(): Promise<E2eAppContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  return { app, moduleRef };
}

export async function closeApp(ctx: E2eAppContext): Promise<void> {
  await ctx.app.close();
}
