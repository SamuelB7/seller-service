import { Inject, Injectable } from '@nestjs/common';
import { sellerPayoutAccountUpdatedEvent } from '../../domain/seller-events';
import { PayoutAccountInput, PayoutAccountView, SELLER_REPOSITORY, SellerActor, SellerRepository } from '../../domain/ports/seller.repository';

@Injectable()
export class ManagePayoutAccountUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async get(actor: SellerActor): Promise<PayoutAccountView | null> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.getPayoutAccount(seller.id);
  }

  async update(actor: SellerActor, payoutAccount: PayoutAccountInput): Promise<PayoutAccountView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.upsertPayoutAccount({
      sellerId: seller.id,
      payoutAccount,
      outboxEvent: sellerPayoutAccountUpdatedEvent({ sellerId: seller.id })
    });
  }
}

