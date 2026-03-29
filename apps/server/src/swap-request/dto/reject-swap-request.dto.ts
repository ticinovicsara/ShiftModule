import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class RejectSwapRequestDto {
  @ApiProperty({
    example: 'Groups are locked after week 3',
    required: false,
    description: 'Reason for rejecting the swap request',
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  reason?: string;
}
