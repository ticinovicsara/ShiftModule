import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Programiranje 1' })
  @IsString()
  @IsNotEmpty({ message: 'Course title is required' })
  title: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'Invalid study major ID format' })
  studyMajorId: string;

  @ApiProperty({
    example: 'https://moodle.fesb.hr/course/view.php?id=123',
    required: false,
    description: 'Link to Moodle/Merlin course page',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid URL format for Merlin URL' })
  merlinUrl?: string;
}
