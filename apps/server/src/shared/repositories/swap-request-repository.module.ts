import { Module } from '@nestjs/common';
import { MockSwapRequestRepository } from '../../repositories/mock/mock-swap-request.repository';

@Module({
  providers: [
    {
      provide: 'ISwapRequestRepository',
      useClass: MockSwapRequestRepository,
    },
  ],
  exports: ['ISwapRequestRepository'],
})
export class SwapRequestRepositoryModule {}
