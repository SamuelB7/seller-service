import { Inject, Injectable } from '@nestjs/common';
import { sellerKycDocumentSubmittedEvent } from '../../domain/seller-events';
import { SELLER_REPOSITORY, SellerActor, SellerDocumentInput, SellerDocumentView, SellerRepository } from '../../domain/ports/seller.repository';

@Injectable()
export class ManageDocumentsUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async add(actor: SellerActor, document: SellerDocumentInput): Promise<SellerDocumentView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.addDocument({
      sellerId: seller.id,
      document,
      outboxEvent: sellerKycDocumentSubmittedEvent({
        sellerId: seller.id,
        documentId: 'pending',
        documentType: document.documentType
      })
    });
  }

  async list(actor: SellerActor): Promise<SellerDocumentView[]> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.listDocuments(seller.id);
  }
}

