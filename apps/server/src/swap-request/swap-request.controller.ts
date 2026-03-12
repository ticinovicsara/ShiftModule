import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SwapRequestService } from './swap-request.service';
import { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import { RejectSwapRequestDto } from './dto/reject-swap-request.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('swap-request')
@UseGuards(AuthGuard, RolesGuard)
export class SwapRequestController {
  constructor(private readonly swapRequestService: SwapRequestService) {}

  // ─── STUDENT ────────────────────────────────────────────────

  @Get('student/requests')
  @Roles('STUDENT')
  async getMyRequests(@Param('studentId') studentId: string) {
    const data = await this.swapRequestService.getMyRequests(studentId);
    return { data, error: null, message: 'OK' };
  }

  @Post('student/requests')
  @Roles('STUDENT')
  async createRequest(
    @Param('studentId') studentId: string,
    @Body() dto: CreateSwapRequestDto,
  ) {
    const data = await this.swapRequestService.createRequest(studentId, dto);
    return { data, error: null, message: 'Request created' };
  }

  @Post('student/requests/:id/confirm-partner')
  @Roles('STUDENT')
  async confirmPartner(
    @Param('studentId') studentId: string,
    @Param('id') requestId: string,
  ) {
    const data = await this.swapRequestService.confirmPartner(
      requestId,
      studentId,
    );
    return { data, error: null, message: 'Partner confirmed' };
  }

  // ─── PROFESSOR ──────────────────────────────────────────────

  @Get('professor/requests')
  @Roles('PROFESSOR')
  async getCourseRequests(
    @Query('courseId') courseId: string,
    @Query('mode') mode: 'MANUAL' | 'SEMI_AUTO' | 'AUTO',
  ) {
    const data = await this.swapRequestService.getCourseRequests(
      courseId,
      mode,
    );
    return { data, error: null, message: 'OK' };
  }

  @Post('professor/requests/:id/approve')
  @Roles('PROFESSOR')
  async approveRequest(@Param('id') id: string) {
    const data = await this.swapRequestService.approveRequest(id);
    return { data, error: null, message: 'Request approved' };
  }

  @Post('professor/requests/:id/reject')
  @Roles('PROFESSOR')
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectSwapRequestDto,
  ) {
    const data = await this.swapRequestService.rejectRequest(id, dto);
    return { data, error: null, message: 'Request rejected' };
  }
}
