import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SwapRequestType } from '@repo/types';

export class CreateSwapRequestDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsString()
  @IsNotEmpty({ message: 'Session type ID is required' })
  sessionTypeId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsString()
  @IsNotEmpty({ message: 'Current group ID is required' })
  currentGroupId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  @IsString()
  @IsNotEmpty({ message: 'Desired group ID is required' })
  desiredGroupId!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174004',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Second choice group ID cannot be empty' })
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
