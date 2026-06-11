import { Inject, Injectable } from '@nestjs/common';
import { SELLER_REPOSITORY, SellerRepository } from '../../domain/ports/seller.repository';

@Injectable()
export class SyncSellerFromAuthEventUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async execute(payload: unknown): Promise<void> {
    if (!this.isSellerRegisteredEvent(payload)) {
      return;
    }

    await this.sellerRepository.createSellerFromAuthEvent({
      authUserId: payload.userId,
      email: payload.email
    });
  }

  private isSellerRegisteredEvent(payload: unknown): payload is { userId: string; email: string; role: 'SELLER' } {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return candidate.role === 'SELLER' && typeof candidate.userId === 'string' && typeof candidate.email === 'string';
  }
}

