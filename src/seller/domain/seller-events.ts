import { SellerStatus, SellerTeamRole } from './seller-types';
import { DomainEventDraft } from './domain-event';

const occurredAt = () => new Date().toISOString();

const event = (topic: string, payload: Record<string, unknown>): DomainEventDraft => ({
  topic,
  type: topic,
  payload: { ...payload, occurredAt: occurredAt() }
});

export const sellerApplicationSubmittedEvent = (payload: { sellerId: string; authUserId: string }) =>
  event('seller.application.submitted.v1', payload);

export const sellerKycDocumentSubmittedEvent = (payload: { sellerId: string; documentId: string; documentType: string }) =>
  event('seller.kyc_document.submitted.v1', payload);

export const sellerProfileUpdatedEvent = (payload: { sellerId: string }) => event('seller.profile.updated.v1', payload);

export const sellerPayoutAccountUpdatedEvent = (payload: { sellerId: string }) => event('seller.payout_account.updated.v1', payload);

export const sellerTeamMemberInvitedEvent = (payload: { sellerId: string; memberId: string; email: string; role: SellerTeamRole }) =>
  event('seller.team_member.invited.v1', payload);

export const sellerTeamMemberUpdatedEvent = (payload: { sellerId: string; memberId: string; role: SellerTeamRole }) =>
  event('seller.team_member.updated.v1', payload);

export const sellerTeamMemberRemovedEvent = (payload: { sellerId: string; memberId: string }) =>
  event('seller.team_member.removed.v1', payload);

export const sellerFulfillmentSettingsUpdatedEvent = (payload: { sellerId: string }) =>
  event('seller.fulfillment_settings.updated.v1', payload);

export function sellerStatusChangedEvent(payload: {
  sellerId: string;
  fromStatus?: SellerStatus | null;
  toStatus: SellerStatus;
  actorUserId: string;
  reason?: string;
}): DomainEventDraft {
  const topicsByStatus: Record<SellerStatus, string> = {
    DRAFT: 'seller.status.changed.v1',
    PENDING_REVIEW: 'seller.application.submitted.v1',
    ACTIVE: payload.fromStatus === 'SUSPENDED' ? 'seller.reactivated.v1' : 'seller.approved.v1',
    REJECTED: 'seller.rejected.v1',
    SUSPENDED: 'seller.suspended.v1'
  };

  return event(topicsByStatus[payload.toStatus], payload);
}

