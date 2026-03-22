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
import { SwapMode, UserRole } from '@repo/types';
import { SwapRequestService } from './swap-request.service';
import type { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import type { RejectSwapRequestDto } from './dto/reject-swap-request.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('swap-request')
@UseGuards(AuthGuard, RolesGuard)
export class SwapRequestController {
  constructor(private readonly swapRequestService: SwapRequestService) {}

  @Get('student/requests')
  @Roles(UserRole.STUDENT)
  async getMyRequests(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.getMyRequests(studentId);
    return { data, error: null, message: 'OK' };
  }

  @Get('admin/requests')
  @Roles(UserRole.ADMIN)
  async getAllRequests(@Query('courseId') courseId?: string) {
    const data = await this.swapRequestService.getAllRequests(courseId);
    return { data, error: null, message: 'OK' };
  }

  @Post('student/requests')
  @Roles(UserRole.STUDENT)
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
  @Roles(UserRole.STUDENT)
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

  @Post('student/requests/:id/decline-partner')
  @Roles(UserRole.STUDENT)
  async declinePartner(
    @Req() request: Request,
    @Param('id') requestId: string,
  ) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.declinePartner(
      requestId,
      studentId,
    );
    return { data, error: null, message: 'Partner declined' };
  }

  @Get('professor/requests')
  @Roles(UserRole.PROFESSOR)
  async getCourseRequests(
    @Req() request: Request,
    @Query('courseId') courseId?: string,
    @Query('mode') mode: SwapMode = SwapMode.MANUAL,
  ) {
    const professorId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.getCourseRequests(
      courseId,
      mode,
      professorId,
    );
    return { data, error: null, message: 'OK' };
  }

  @Post('requests/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  async approveRequest(@Param('id') id: string) {
    const data = await this.swapRequestService.approveRequest(id);
    return { data, error: null, message: 'Request approved' };
  }

  @Post('requests/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectSwapRequestDto,
  ) {
    const data = await this.swapRequestService.rejectRequest(id, dto);
    return { data, error: null, message: 'Request rejected' };
  }
}
