-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SellerApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SellerDocumentStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SellerTeamRole" AS ENUM ('OWNER', 'MANAGER', 'OPERATIONS', 'FINANCE');

-- CreateEnum
CREATE TYPE "SellerTeamMemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PolicyWarningSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SellerStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_applications" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "status" "SellerApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "seller_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_store_profiles" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "supportEmail" TEXT,
    "returnPolicy" TEXT,
    "shippingPolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_store_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_documents" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileReference" TEXT NOT NULL,
    "status" "SellerDocumentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "seller_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_payout_accounts" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT,
    "branchNumber" TEXT,
    "accountNumberLast4" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "externalAccountRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_payout_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_team_members" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "authUserId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "SellerTeamRole" NOT NULL,
    "status" "SellerTeamMemberStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_fulfillment_settings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "originState" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "originPostalCode" TEXT NOT NULL,
    "handlingTimeDays" INTEGER NOT NULL DEFAULT 2,
    "pickupEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dropOffEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_fulfillment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_status_history" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "fromStatus" "SellerStatus",
    "toStatus" "SellerStatus" NOT NULL,
    "actorUserId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_policy_warnings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "PolicyWarningSeverity" NOT NULL DEFAULT 'LOW',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_policy_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sellers_authUserId_key" ON "sellers"("authUserId");

-- CreateIndex
CREATE INDEX "sellers_email_idx" ON "sellers"("email");

-- CreateIndex
CREATE INDEX "sellers_status_idx" ON "sellers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "seller_applications_sellerId_key" ON "seller_applications"("sellerId");

-- CreateIndex
CREATE INDEX "seller_applications_status_idx" ON "seller_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "seller_store_profiles_sellerId_key" ON "seller_store_profiles"("sellerId");

-- CreateIndex
CREATE INDEX "seller_documents_sellerId_idx" ON "seller_documents"("sellerId");

-- CreateIndex
CREATE INDEX "seller_documents_status_idx" ON "seller_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "seller_payout_accounts_sellerId_key" ON "seller_payout_accounts"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_team_members_sellerId_email_key" ON "seller_team_members"("sellerId", "email");

-- CreateIndex
CREATE INDEX "seller_team_members_sellerId_idx" ON "seller_team_members"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_fulfillment_settings_sellerId_key" ON "seller_fulfillment_settings"("sellerId");

-- CreateIndex
CREATE INDEX "seller_status_history_sellerId_idx" ON "seller_status_history"("sellerId");

-- CreateIndex
CREATE INDEX "seller_status_history_toStatus_idx" ON "seller_status_history"("toStatus");

-- CreateIndex
CREATE INDEX "seller_policy_warnings_sellerId_idx" ON "seller_policy_warnings"("sellerId");

-- CreateIndex
CREATE INDEX "seller_policy_warnings_severity_idx" ON "seller_policy_warnings"("severity");

-- CreateIndex
CREATE INDEX "outbox_events_topic_idx" ON "outbox_events"("topic");

-- CreateIndex
CREATE INDEX "outbox_events_publishedAt_idx" ON "outbox_events"("publishedAt");

-- AddForeignKey
ALTER TABLE "seller_applications" ADD CONSTRAINT "seller_applications_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_store_profiles" ADD CONSTRAINT "seller_store_profiles_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_documents" ADD CONSTRAINT "seller_documents_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_payout_accounts" ADD CONSTRAINT "seller_payout_accounts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_team_members" ADD CONSTRAINT "seller_team_members_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_fulfillment_settings" ADD CONSTRAINT "seller_fulfillment_settings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_status_history" ADD CONSTRAINT "seller_status_history_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_policy_warnings" ADD CONSTRAINT "seller_policy_warnings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
