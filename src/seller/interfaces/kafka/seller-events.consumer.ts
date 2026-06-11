import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { SyncSellerFromAuthEventUseCase } from '../../application/use-cases/sync-seller-from-auth-event.use-case';

@Controller()
export class SellerEventsConsumer {
  constructor(private readonly syncSellerFromAuthEventUseCase: SyncSellerFromAuthEventUseCase) {}

  @EventPattern('auth.user.registered.v1')
  async handleUserRegistered(@Payload() payload: unknown, @Ctx() context: KafkaContext): Promise<void> {
    await this.syncSellerFromAuthEventUseCase.execute(payload);
    console.log('[seller-service] consumed integration event', {
      topic: context.getTopic(),
      partition: context.getPartition(),
      offset: context.getMessage().offset,
      payload
    });
  }
}

