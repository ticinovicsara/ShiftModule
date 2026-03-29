import { Controller, Get } from '@nestjs/common';
import { AppConfig } from './config/app.config';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    const data = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: AppConfig.nodeEnv,
    };

    return { data, error: null, message: 'OK' };
  }
}
