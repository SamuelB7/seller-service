import { Inject, Injectable } from '@nestjs/common';
import { sellerStatusChangedEvent } from '../../domain/seller-events';
import { SELLER_REPOSITORY, SellerApplicationSummary, SellerRepository, SellerView } from '../../domain/ports/seller.repository';
import { SellerStatus } from '../../domain/seller-types';
import { sellerError } from '../seller.errors';

@Injectable()
export class ManageSellerStatusUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  listApplications(): Promise<SellerApplicationSummary[]> {
    return this.sellerRepository.listApplications();
  }

  async changeStatus(input: { sellerId: string; toStatus: SellerStatus; actorUserId: string; reason?: string }): Promise<SellerView> {
    const seller = await this.sellerRepository.findSellerById(input.sellerId);

    if (!seller) {
      throw sellerError('SELLER_NOT_FOUND', 'Seller not found.');
    }

    const updated = await this.sellerRepository.changeStatus({
      sellerId: input.sellerId,
      toStatus: input.toStatus,
      actorUserId: input.actorUserId,
      reason: input.reason,
      outboxEvent: sellerStatusChangedEvent({
        sellerId: input.sellerId,
        fromStatus: seller.status,
        toStatus: input.toStatus,
        actorUserId: input.actorUserId,
        reason: input.reason
      })
    });

    if (!updated) {
      throw sellerError('SELLER_NOT_FOUND', 'Seller not found.');
    }

    return updated;
  }
}

