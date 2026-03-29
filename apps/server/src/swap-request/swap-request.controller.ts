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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SwapMode, UserRole } from '@repo/types';
import { SwapRequestService } from './swap-request.service';
import type { CreateSwapRequestDto } from './dto/create-swap-request.dto';
import type { RejectSwapRequestDto } from './dto/reject-swap-request.dto';
import { AuthGuard, RolesGuard, Roles } from '../auth';

@Controller('swap-requests')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('swap-requests')
@ApiBearerAuth()
export class SwapRequestController {
  constructor(private readonly swapRequestService: SwapRequestService) {}

  @Get('student/requests')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student swap requests' })
  @ApiResponse({ status: 200, description: 'Student swap requests fetched' })
  async getMyRequests(@Req() request: Request) {
    const studentId = (request as Request & { user?: { id?: string } }).user
      ?.id;
    const data = await this.swapRequestService.getMyRequests(studentId);
    return { data, error: null, message: 'OK' };
  }

  @Get('admin/requests')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all swap requests (admin)' })
  @ApiResponse({ status: 200, description: 'Swap requests fetched' })
  async getAllRequests(@Query('courseId') courseId?: string) {
    const data = await this.swapRequestService.getAllRequests(courseId);
    return { data, error: null, message: 'OK' };
  }

  @Post('student/requests')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create swap request (student)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', example: 'course-osnove-1' },
        sessionTypeId: { type: 'string', example: 'session-osnove-lab-1' },
        currentGroupId: { type: 'string', example: 'group-osnove-lab-1' },
        desiredGroupId: { type: 'string', example: 'group-osnove-lab-2' },
        secondChoiceGroupId: { type: 'string', example: 'group-osnove-lab-3' },
        requestType: { type: 'string', example: 'SOLO' },
        reason: {
          type: 'string',
          example: 'Schedule conflict with another class.',
        },
        partnerEmail: { type: 'string', example: 'student2@fesb.hr' },
      },
      required: [
        'courseId',
        'sessionTypeId',
        'currentGroupId',
        'desiredGroupId',
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Swap request created' })
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
  @ApiOperation({ summary: 'Confirm partner swap request (student)' })
  @ApiResponse({ status: 201, description: 'Partner request confirmed' })
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
  @ApiOperation({ summary: 'Decline partner swap request (student)' })
  @ApiResponse({ status: 201, description: 'Partner request declined' })
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
  @ApiOperation({ summary: 'Get course swap requests (professor)' })
  @ApiResponse({
    status: 200,
    description: 'Professor course requests fetched',
  })
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
  @ApiOperation({ summary: 'Approve swap request' })
  @ApiResponse({ status: 201, description: 'Swap request approved' })
  async approveRequest(@Param('id') id: string) {
    const data = await this.swapRequestService.approveRequest(id);
    return { data, error: null, message: 'Request approved' };
  }

  @Post('requests/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Reject swap request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Capacity exceeded in desired group.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Swap request rejected' })
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectSwapRequestDto,
  ) {
    const data = await this.swapRequestService.rejectRequest(id, dto);
    return { data, error: null, message: 'Request rejected' };
  }
}
