import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { SwapRequestService } from './swap-request.service';
import type { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import type { RejectSwapRequestDto } from './dto/reject-swap-request.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('swap-request')
@UseGuards(AuthGuard, RolesGuard)
export class SwapRequestController {
  constructor(private readonly swapRequestService: SwapRequestService) {}

  @Get('student/requests')
  @Roles('STUDENT')
  async getMyRequests(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.getMyRequests(studentId);
    return { data, error: null, message: 'OK' };
  }

  @Get('admin/requests')
  @Roles('ADMIN')
  async getAllRequests(@Query('courseId') courseId?: string) {
    const data = await this.swapRequestService.getAllRequests(courseId);
    return { data, error: null, message: 'OK' };
  }

  @Post('student/requests')
  @Roles('STUDENT')
  async createRequest(
    @Req() request: Request,
    @Body() dto: CreateSwapRequestDto,
  ) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.createRequest(studentId, dto);
    return { data, error: null, message: 'Request created' };
  }

  @Post('student/requests/:id/confirm-partner')
  @Roles('STUDENT')
  async confirmPartner(
    @Req() request: Request,
    @Param('id') requestId: string,
  ) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.confirmPartner(
      requestId,
      studentId,
    );
    return { data, error: null, message: 'Partner confirmed' };
  }

  @Get('professor/requests')
  @Roles('PROFESSOR')
  async getCourseRequests(
    @Query('courseId') courseId?: string,
    @Query('mode') mode: 'MANUAL' | 'SEMI_AUTO' | 'AUTO' = 'MANUAL',
  ) {
    const data = await this.swapRequestService.getCourseRequests(
      courseId,
      mode,
    );
    return { data, error: null, message: 'OK' };
  }

  @Post('professor/requests/:id/approve')
  @Roles('PROFESSOR', 'ADMIN')
  async approveRequest(@Param('id') id: string) {
    const data = await this.swapRequestService.approveRequest(id);
    return { data, error: null, message: 'Request approved' };
  }

  @Post('professor/requests/:id/reject')
  @Roles('PROFESSOR', 'ADMIN')
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectSwapRequestDto,
  ) {
    const data = await this.swapRequestService.rejectRequest(id, dto);
    return { data, error: null, message: 'Request rejected' };
  }
}
