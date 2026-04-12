import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetSwapSatisfactionDto {
  @ApiProperty({
    description:
      'Whether the resolved swap outcome satisfied the student expectation',
    example: true,
  })
  @IsBoolean()
  accepted!: boolean;
}
