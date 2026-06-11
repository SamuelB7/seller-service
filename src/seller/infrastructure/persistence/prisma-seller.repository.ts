import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { DomainEventDraft } from '../../domain/domain-event';
import {
  AccountHealthView,
  FulfillmentSettingsInput,
  FulfillmentSettingsView,
  PayoutAccountInput,
  PayoutAccountView,
  SELLER_REPOSITORY,
  SellerActor,
  SellerApplicationInput,
  SellerApplicationSummary,
  SellerApplicationView,
  SellerDocumentInput,
  SellerDocumentView,
  SellerRepository,
  SellerView,
  StoreProfileInput,
  StoreProfileView,
  TeamMemberInput,
  TeamMemberPatch,
  TeamMemberView
} from '../../domain/ports/seller.repository';
import { PolicyWarningSeverity, SellerStatus, SellerTeamMemberStatus, SellerTeamRole } from '../../domain/seller-types';

type PrismaSeller = Prisma.SellerGetPayload<object>;
type PrismaApplication = Prisma.SellerApplicationGetPayload<object>;
type PrismaStoreProfile = Prisma.SellerStoreProfileGetPayload<object>;
type PrismaDocument = Prisma.SellerDocumentGetPayload<object>;
type PrismaPayout = Prisma.SellerPayoutAccountGetPayload<object>;
type PrismaTeamMember = Prisma.SellerTeamMemberGetPayload<object>;
type PrismaFulfillment = Prisma.SellerFulfillmentSettingsGetPayload<object>;
type PrismaWarning = Prisma.SellerPolicyWarningGetPayload<object>;
type PrismaSellerWithApplication = Prisma.SellerGetPayload<{ include: { application: true } }>;

@Injectable()
export class PrismaSellerRepository implements SellerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSeller(actor: SellerActor): Promise<SellerView> {
    const seller = await this.prisma.seller.upsert({
      where: { authUserId: actor.authUserId },
      update: { email: actor.email },
      create: {
        authUserId: actor.authUserId,
        email: actor.email,
        teamMembers: {
          create: {
            authUserId: actor.authUserId,
            email: actor.email,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      }
    });

    return this.mapSeller(seller);
  }

  async createSellerFromAuthEvent(input: { authUserId: string; email: string }): Promise<SellerView> {
    return this.ensureSeller({
      authUserId: input.authUserId,
      email: input.email,
      roles: ['SELLER']
    });
  }

  async findSellerByAuthUserId(authUserId: string): Promise<SellerView | null> {
    const seller = await this.prisma.seller.findUnique({ where: { authUserId } });
    return seller ? this.mapSeller(seller) : null;
  }

  async findSellerById(sellerId: string): Promise<SellerView | null> {
    const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
    return seller ? this.mapSeller(seller) : null;
  }

  submitApplication(input: {
    sellerId: string;
    application: SellerApplicationInput;
    outboxEvent: DomainEventDraft;
  }): Promise<SellerApplicationView> {
    return this.prisma.$transaction(async (tx) => {
      const seller = await tx.seller.update({
        where: { id: input.sellerId },
        data: { status: 'PENDING_REVIEW' }
      });

      const application = await tx.sellerApplication.upsert({
        where: { sellerId: input.sellerId },
        update: {
          ...input.application,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          reviewedAt: null,
          rejectionReason: null
        },
        create: {
          sellerId: input.sellerId,
          ...input.application
        }
      });

      await tx.sellerStatusHistory.create({
        data: {
          sellerId: input.sellerId,
          fromStatus: seller.status,
          toStatus: 'PENDING_REVIEW',
          actorUserId: seller.authUserId
        }
      });

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });

      return this.mapApplication(application);
    });
  }

  async getApplication(sellerId: string): Promise<SellerApplicationView | null> {
    const application = await this.prisma.sellerApplication.findUnique({ where: { sellerId } });
    return application ? this.mapApplication(application) : null;
  }

  addDocument(input: { sellerId: string; document: SellerDocumentInput; outboxEvent: DomainEventDraft }): Promise<SellerDocumentView> {
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.sellerDocument.create({
        data: {
          sellerId: input.sellerId,
          documentType: input.document.documentType,
          fileReference: input.document.fileReference
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate({
          ...input.outboxEvent,
          payload: { ...input.outboxEvent.payload, documentId: document.id }
        })
      });

      return this.mapDocument(document);
    });
  }

  async listDocuments(sellerId: string): Promise<SellerDocumentView[]> {
    const documents = await this.prisma.sellerDocument.findMany({
      where: { sellerId },
      orderBy: { submittedAt: 'desc' }
    });

    return documents.map((document) => this.mapDocument(document));
  }

  async getStoreProfile(sellerId: string): Promise<StoreProfileView | null> {
    const profile = await this.prisma.sellerStoreProfile.findUnique({ where: { sellerId } });
    return profile ? this.mapStoreProfile(profile) : null;
  }

  upsertStoreProfile(input: { sellerId: string; profile: StoreProfileInput; outboxEvent: DomainEventDraft }): Promise<StoreProfileView> {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.sellerStoreProfile.upsert({
        where: { sellerId: input.sellerId },
        update: input.profile,
        create: {
          sellerId: input.sellerId,
          ...input.profile
        }
      });

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });

      return this.mapStoreProfile(profile);
    });
  }

  async getPayoutAccount(sellerId: string): Promise<PayoutAccountView | null> {
    const payout = await this.prisma.sellerPayoutAccount.findUnique({ where: { sellerId } });
    return payout ? this.mapPayout(payout) : null;
  }

  upsertPayoutAccount(input: {
    sellerId: string;
    payoutAccount: PayoutAccountInput;
    outboxEvent: DomainEventDraft;
  }): Promise<PayoutAccountView> {
    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.sellerPayoutAccount.upsert({
        where: { sellerId: input.sellerId },
        update: input.payoutAccount,
        create: {
          sellerId: input.sellerId,
          ...input.payoutAccount
        }
      });

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });

      return this.mapPayout(payout);
    });
  }

  async listTeamMembers(sellerId: string): Promise<TeamMemberView[]> {
    const members = await this.prisma.sellerTeamMember.findMany({
      where: { sellerId },
      orderBy: { invitedAt: 'desc' }
    });

    return members.map((member) => this.mapTeamMember(member));
  }

  upsertTeamMember(input: { sellerId: string; member: TeamMemberInput; outboxEvent: DomainEventDraft }): Promise<TeamMemberView> {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.sellerTeamMember.upsert({
        where: {
          sellerId_email: {
            sellerId: input.sellerId,
            email: input.member.email
          }
        },
        update: {
          authUserId: input.member.authUserId,
          name: input.member.name,
          role: input.member.role,
          status: 'INVITED'
        },
        create: {
          sellerId: input.sellerId,
          authUserId: input.member.authUserId,
          email: input.member.email,
          name: input.member.name,
          role: input.member.role
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate({
          ...input.outboxEvent,
          payload: { ...input.outboxEvent.payload, memberId: member.id }
        })
      });

      return this.mapTeamMember(member);
    });
  }

  updateTeamMember(input: {
    sellerId: string;
    memberId: string;
    patch: TeamMemberPatch;
    outboxEvent: DomainEventDraft;
  }): Promise<TeamMemberView | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.sellerTeamMember.findFirst({ where: { id: input.memberId, sellerId: input.sellerId } });

      if (!existing) {
        return null;
      }

      const member = await tx.sellerTeamMember.update({
        where: { id: input.memberId },
        data: input.patch
      });

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });

      return this.mapTeamMember(member);
    });
  }

  removeTeamMember(input: { sellerId: string; memberId: string; outboxEvent: DomainEventDraft }): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.sellerTeamMember.deleteMany({
        where: { id: input.memberId, sellerId: input.sellerId }
      });

      if (result.count === 0) {
        return false;
      }

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });
      return true;
    });
  }

  async getFulfillmentSettings(sellerId: string): Promise<FulfillmentSettingsView | null> {
    const settings = await this.prisma.sellerFulfillmentSettings.findUnique({ where: { sellerId } });
    return settings ? this.mapFulfillment(settings) : null;
  }

  upsertFulfillmentSettings(input: {
    sellerId: string;
    settings: FulfillmentSettingsInput;
    outboxEvent: DomainEventDraft;
  }): Promise<FulfillmentSettingsView> {
    return this.prisma.$transaction(async (tx) => {
      const settings = await tx.sellerFulfillmentSettings.upsert({
        where: { sellerId: input.sellerId },
        update: input.settings,
        create: {
          sellerId: input.sellerId,
          ...input.settings
        }
      });

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });

      return this.mapFulfillment(settings);
    });
  }

  async listApplications(): Promise<SellerApplicationSummary[]> {
    const sellers = await this.prisma.seller.findMany({
      where: { application: { isNot: null } },
      include: { application: true },
      orderBy: { createdAt: 'desc' }
    });

    return sellers.map((seller) => ({
      ...this.mapSeller(seller),
      application: seller.application ? this.mapApplication(seller.application) : null
    }));
  }

  changeStatus(input: {
    sellerId: string;
    toStatus: SellerStatus;
    actorUserId: string;
    reason?: string;
    outboxEvent: DomainEventDraft;
  }): Promise<SellerView | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.seller.findUnique({ where: { id: input.sellerId } });

      if (!existing) {
        return null;
      }

      const seller = await tx.seller.update({
        where: { id: input.sellerId },
        data: { status: input.toStatus }
      });

      await tx.sellerStatusHistory.create({
        data: {
          sellerId: seller.id,
          fromStatus: existing.status,
          toStatus: input.toStatus,
          actorUserId: input.actorUserId,
          reason: input.reason
        }
      });

      if (input.toStatus === 'ACTIVE') {
        await tx.sellerApplication.updateMany({
          where: { sellerId: seller.id },
          data: { status: 'APPROVED', reviewedAt: new Date(), rejectionReason: null }
        });
      }

      if (input.toStatus === 'REJECTED') {
        await tx.sellerApplication.updateMany({
          where: { sellerId: seller.id },
          data: { status: 'REJECTED', reviewedAt: new Date(), rejectionReason: input.reason }
        });
      }

      await tx.outboxEvent.create({ data: this.toOutboxCreate(input.outboxEvent) });

      return this.mapSeller(seller);
    });
  }

  async getAccountHealth(sellerId: string): Promise<AccountHealthView> {
    const seller = await this.prisma.seller.findUniqueOrThrow({ where: { id: sellerId } });
    const warnings = await this.prisma.sellerPolicyWarning.findMany({
      where: { sellerId, resolvedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return {
      status: seller.status as SellerStatus,
      warningCount: warnings.length,
      highSeverityWarningCount: warnings.filter((warning) => warning.severity === 'HIGH').length,
      warnings: warnings.map((warning) => this.mapWarning(warning))
    };
  }

  private mapSeller(seller: PrismaSeller): SellerView {
    return {
      id: seller.id,
      authUserId: seller.authUserId,
      email: seller.email,
      status: seller.status as SellerStatus,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt
    };
  }

  private mapApplication(application: PrismaApplication): SellerApplicationView {
    return {
      id: application.id,
      legalName: application.legalName,
      businessName: application.businessName,
      taxId: application.taxId,
      businessType: application.businessType,
      status: application.status,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      rejectionReason: application.rejectionReason
    };
  }

  private mapDocument(document: PrismaDocument): SellerDocumentView {
    return {
      id: document.id,
      documentType: document.documentType,
      fileReference: document.fileReference,
      status: document.status,
      reviewNotes: document.reviewNotes,
      submittedAt: document.submittedAt,
      reviewedAt: document.reviewedAt
    };
  }

  private mapStoreProfile(profile: PrismaStoreProfile): StoreProfileView {
    return {
      id: profile.id,
      storeName: profile.storeName,
      description: profile.description ?? undefined,
      logoUrl: profile.logoUrl ?? undefined,
      bannerUrl: profile.bannerUrl ?? undefined,
      supportEmail: profile.supportEmail ?? undefined,
      returnPolicy: profile.returnPolicy ?? undefined,
      shippingPolicy: profile.shippingPolicy ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }

  private mapPayout(payout: PrismaPayout): PayoutAccountView {
    return {
      id: payout.id,
      accountHolderName: payout.accountHolderName,
      bankName: payout.bankName,
      bankCode: payout.bankCode ?? undefined,
      branchNumber: payout.branchNumber ?? undefined,
      accountNumberLast4: payout.accountNumberLast4,
      accountType: payout.accountType,
      externalAccountRef: payout.externalAccountRef ?? undefined,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt
    };
  }

  private mapTeamMember(member: PrismaTeamMember): TeamMemberView {
    return {
      id: member.id,
      authUserId: member.authUserId ?? undefined,
      email: member.email,
      name: member.name ?? undefined,
      role: member.role as SellerTeamRole,
      status: member.status as SellerTeamMemberStatus,
      invitedAt: member.invitedAt,
      updatedAt: member.updatedAt
    };
  }

  private mapFulfillment(settings: PrismaFulfillment): FulfillmentSettingsView {
    return {
      id: settings.id,
      originCountry: settings.originCountry,
      originState: settings.originState,
      originCity: settings.originCity,
      originPostalCode: settings.originPostalCode,
      handlingTimeDays: settings.handlingTimeDays,
      pickupEnabled: settings.pickupEnabled,
      dropOffEnabled: settings.dropOffEnabled,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };
  }

  private mapWarning(warning: PrismaWarning) {
    return {
      id: warning.id,
      code: warning.code,
      message: warning.message,
      severity: warning.severity as PolicyWarningSeverity,
      resolvedAt: warning.resolvedAt,
      createdAt: warning.createdAt
    };
  }

  private toOutboxCreate(event: DomainEventDraft) {
    return {
      topic: event.topic,
      type: event.type,
      payload: event.payload as Prisma.InputJsonValue
    };
  }
}

