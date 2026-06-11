import { DomainEventDraft } from '../domain-event';
import { PolicyWarningSeverity, SellerStatus, SellerTeamMemberStatus, SellerTeamRole } from '../seller-types';

export const SELLER_REPOSITORY = Symbol('SELLER_REPOSITORY');

export type SellerActor = {
  authUserId: string;
  email: string;
  roles: string[];
};

export type SellerView = {
  id: string;
  authUserId: string;
  email: string;
  status: SellerStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SellerApplicationInput = {
  legalName: string;
  businessName: string;
  taxId: string;
  businessType: string;
};

export type SellerApplicationView = SellerApplicationInput & {
  id: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
};

export type SellerDocumentInput = {
  documentType: string;
  fileReference: string;
};

export type SellerDocumentView = SellerDocumentInput & {
  id: string;
  status: string;
  reviewNotes?: string | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
};

export type StoreProfileInput = {
  storeName: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  supportEmail?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
};

export type StoreProfileView = StoreProfileInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PayoutAccountInput = {
  accountHolderName: string;
  bankName: string;
  bankCode?: string;
  branchNumber?: string;
  accountNumberLast4: string;
  accountType: string;
  externalAccountRef?: string;
};

export type PayoutAccountView = PayoutAccountInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TeamMemberInput = {
  authUserId?: string;
  email: string;
  name?: string;
  role: SellerTeamRole;
};

export type TeamMemberPatch = {
  name?: string;
  role?: SellerTeamRole;
  status?: SellerTeamMemberStatus;
};

export type TeamMemberView = TeamMemberInput & {
  id: string;
  status: SellerTeamMemberStatus;
  invitedAt: Date;
  updatedAt: Date;
};

export type FulfillmentSettingsInput = {
  originCountry: string;
  originState: string;
  originCity: string;
  originPostalCode: string;
  handlingTimeDays: number;
  pickupEnabled: boolean;
  dropOffEnabled: boolean;
};

export type FulfillmentSettingsView = FulfillmentSettingsInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PolicyWarningView = {
  id: string;
  code: string;
  message: string;
  severity: PolicyWarningSeverity;
  resolvedAt?: Date | null;
  createdAt: Date;
};

export type AccountHealthView = {
  status: SellerStatus;
  warningCount: number;
  highSeverityWarningCount: number;
  warnings: PolicyWarningView[];
};

export type SellerApplicationSummary = SellerView & {
  application?: SellerApplicationView | null;
};

export interface SellerRepository {
  ensureSeller(actor: SellerActor): Promise<SellerView>;
  createSellerFromAuthEvent(input: { authUserId: string; email: string }): Promise<SellerView>;
  findSellerByAuthUserId(authUserId: string): Promise<SellerView | null>;
  findSellerById(sellerId: string): Promise<SellerView | null>;
  submitApplication(input: { sellerId: string; application: SellerApplicationInput; outboxEvent: DomainEventDraft }): Promise<SellerApplicationView>;
  getApplication(sellerId: string): Promise<SellerApplicationView | null>;
  addDocument(input: { sellerId: string; document: SellerDocumentInput; outboxEvent: DomainEventDraft }): Promise<SellerDocumentView>;
  listDocuments(sellerId: string): Promise<SellerDocumentView[]>;
  getStoreProfile(sellerId: string): Promise<StoreProfileView | null>;
  upsertStoreProfile(input: { sellerId: string; profile: StoreProfileInput; outboxEvent: DomainEventDraft }): Promise<StoreProfileView>;
  getPayoutAccount(sellerId: string): Promise<PayoutAccountView | null>;
  upsertPayoutAccount(input: { sellerId: string; payoutAccount: PayoutAccountInput; outboxEvent: DomainEventDraft }): Promise<PayoutAccountView>;
  listTeamMembers(sellerId: string): Promise<TeamMemberView[]>;
  upsertTeamMember(input: { sellerId: string; member: TeamMemberInput; outboxEvent: DomainEventDraft }): Promise<TeamMemberView>;
  updateTeamMember(input: { sellerId: string; memberId: string; patch: TeamMemberPatch; outboxEvent: DomainEventDraft }): Promise<TeamMemberView | null>;
  removeTeamMember(input: { sellerId: string; memberId: string; outboxEvent: DomainEventDraft }): Promise<boolean>;
  getFulfillmentSettings(sellerId: string): Promise<FulfillmentSettingsView | null>;
  upsertFulfillmentSettings(input: {
    sellerId: string;
    settings: FulfillmentSettingsInput;
    outboxEvent: DomainEventDraft;
  }): Promise<FulfillmentSettingsView>;
  listApplications(): Promise<SellerApplicationSummary[]>;
  changeStatus(input: {
    sellerId: string;
    toStatus: SellerStatus;
    actorUserId: string;
    reason?: string;
    outboxEvent: DomainEventDraft;
  }): Promise<SellerView | null>;
  getAccountHealth(sellerId: string): Promise<AccountHealthView>;
}

