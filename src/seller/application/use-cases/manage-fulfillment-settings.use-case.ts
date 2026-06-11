import { Inject, Injectable } from '@nestjs/common';
import { sellerFulfillmentSettingsUpdatedEvent } from '../../domain/seller-events';
import {
  FulfillmentSettingsInput,
  FulfillmentSettingsView,
  SELLER_REPOSITORY,
  SellerActor,
  SellerRepository
} from '../../domain/ports/seller.repository';

@Injectable()
export class ManageFulfillmentSettingsUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async get(actor: SellerActor): Promise<FulfillmentSettingsView | null> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.getFulfillmentSettings(seller.id);
  }

  async update(actor: SellerActor, settings: FulfillmentSettingsInput): Promise<FulfillmentSettingsView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.upsertFulfillmentSettings({
      sellerId: seller.id,
      settings,
      outboxEvent: sellerFulfillmentSettingsUpdatedEvent({ sellerId: seller.id })
    });
  }
}

