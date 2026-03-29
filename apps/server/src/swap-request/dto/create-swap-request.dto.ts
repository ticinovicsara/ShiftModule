import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { SwapRequestType } from '@repo/types';

export class CreateSwapRequestDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'Invalid course ID format' })
  courseId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID('4', { message: 'Invalid session type ID format' })
  sessionTypeId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID('4', { message: 'Invalid current group ID format' })
  currentGroupId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  @IsUUID('4', { message: 'Invalid desired group ID format' })
  desiredGroupId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174004',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid second choice group ID format' })
  secondChoiceGroupId?: string;

  @ApiProperty({
    enum: SwapRequestType,
    example: SwapRequestType.PAIRED,
    required: false,
  })
  @IsOptional()
  @IsEnum(SwapRequestType, {
    message: 'Invalid request type. Must be PAIRED or SOLO',
  })
  requestType?: SwapRequestType;

  @ApiProperty({
    example: 'Schedule conflict with another course',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 'partner@fesb.hr', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid partner email format' })
  partnerEmail?: string;
}
