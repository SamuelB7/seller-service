import { Inject, Injectable } from '@nestjs/common';
import { sellerProfileUpdatedEvent } from '../../domain/seller-events';
import { SELLER_REPOSITORY, SellerActor, SellerRepository, StoreProfileInput, StoreProfileView } from '../../domain/ports/seller.repository';

@Injectable()
export class ManageStoreProfileUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async get(actor: SellerActor): Promise<StoreProfileView | null> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.getStoreProfile(seller.id);
  }

  async update(actor: SellerActor, profile: StoreProfileInput): Promise<StoreProfileView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.upsertStoreProfile({
      sellerId: seller.id,
      profile,
      outboxEvent: sellerProfileUpdatedEvent({ sellerId: seller.id })
    });
  }
}

