import { Inject, Injectable } from '@nestjs/common';
import { AccountHealthView, SELLER_REPOSITORY, SellerActor, SellerRepository } from '../../domain/ports/seller.repository';

@Injectable()
export class GetAccountHealthUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async execute(actor: SellerActor): Promise<AccountHealthView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.getAccountHealth(seller.id);
  }
}

