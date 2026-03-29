import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Lab Group 1' })
  @IsString()
  @IsNotEmpty({ message: 'Group name is required' })
  name: string;

  @ApiProperty({
    example: 15,
    description: 'Maximum number of students in the group',
  })
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(100, { message: 'Capacity cannot exceed 100' })
  capacity: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'Invalid session type ID format' })
  sessionTypeId: string;
}
