import { Inject, Injectable } from '@nestjs/common';
import { sellerApplicationSubmittedEvent } from '../../domain/seller-events';
import { SELLER_REPOSITORY, SellerActor, SellerApplicationInput, SellerApplicationView, SellerRepository, SellerView } from '../../domain/ports/seller.repository';

@Injectable()
export class ManageApplicationUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async getStatus(actor: SellerActor): Promise<{ seller: SellerView; application?: SellerApplicationView | null }> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    const application = await this.sellerRepository.getApplication(seller.id);
    return { seller, application };
  }

  async submit(actor: SellerActor, application: SellerApplicationInput): Promise<SellerApplicationView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.submitApplication({
      sellerId: seller.id,
      application,
      outboxEvent: sellerApplicationSubmittedEvent({
        sellerId: seller.id,
        authUserId: actor.authUserId
      })
    });
  }
}

