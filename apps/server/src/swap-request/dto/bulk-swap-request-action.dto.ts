import { IsArray, ArrayNotEmpty, IsOptional, IsString } from 'class-validator';

export class BulkSwapRequestActionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}
