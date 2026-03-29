import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API health greeting' })
  @ApiResponse({ status: 200, description: 'Greeting fetched successfully' })
  getHello() {
    const data = this.appService.getHello();
    return { data, error: null, message: 'OK' };
  }
}
