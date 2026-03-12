import { PartialType } from '@nestjs/mapped-types';
import { CreateSwapRequestDto } from './create-swap-request.dto';

export class UpdateSwapRequestDto extends PartialType(CreateSwapRequestDto) {}
