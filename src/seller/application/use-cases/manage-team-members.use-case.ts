import { Inject, Injectable } from '@nestjs/common';
import { sellerTeamMemberInvitedEvent, sellerTeamMemberRemovedEvent, sellerTeamMemberUpdatedEvent } from '../../domain/seller-events';
import {
  SELLER_REPOSITORY,
  SellerActor,
  SellerRepository,
  TeamMemberInput,
  TeamMemberPatch,
  TeamMemberView
} from '../../domain/ports/seller.repository';
import { sellerError } from '../seller.errors';

@Injectable()
export class ManageTeamMembersUseCase {
  constructor(@Inject(SELLER_REPOSITORY) private readonly sellerRepository: SellerRepository) {}

  async list(actor: SellerActor): Promise<TeamMemberView[]> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    return this.sellerRepository.listTeamMembers(seller.id);
  }

  async invite(actor: SellerActor, member: TeamMemberInput): Promise<TeamMemberView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    const saved = await this.sellerRepository.upsertTeamMember({
      sellerId: seller.id,
      member,
      outboxEvent: sellerTeamMemberInvitedEvent({
        sellerId: seller.id,
        memberId: 'pending',
        email: member.email,
        role: member.role
      })
    });

    return saved;
  }

  async update(actor: SellerActor, memberId: string, patch: TeamMemberPatch): Promise<TeamMemberView> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    const updated = await this.sellerRepository.updateTeamMember({
      sellerId: seller.id,
      memberId,
      patch,
      outboxEvent: sellerTeamMemberUpdatedEvent({
        sellerId: seller.id,
        memberId,
        role: patch.role ?? 'MANAGER'
      })
    });

    if (!updated) {
      throw sellerError('TEAM_MEMBER_NOT_FOUND', 'Team member not found.');
    }

    return updated;
  }

  async remove(actor: SellerActor, memberId: string): Promise<{ removed: true }> {
    const seller = await this.sellerRepository.ensureSeller(actor);
    const removed = await this.sellerRepository.removeTeamMember({
      sellerId: seller.id,
      memberId,
      outboxEvent: sellerTeamMemberRemovedEvent({ sellerId: seller.id, memberId })
    });

    if (!removed) {
      throw sellerError('TEAM_MEMBER_NOT_FOUND', 'Team member not found.');
    }

    return { removed: true };
  }
}

