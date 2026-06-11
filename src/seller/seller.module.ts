import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { SELLER_REPOSITORY } from './domain/ports/seller.repository';
import { GetAccountHealthUseCase } from './application/use-cases/get-account-health.use-case';
import { ManageApplicationUseCase } from './application/use-cases/manage-application.use-case';
import { ManageDocumentsUseCase } from './application/use-cases/manage-documents.use-case';
import { ManageFulfillmentSettingsUseCase } from './application/use-cases/manage-fulfillment-settings.use-case';
import { ManagePayoutAccountUseCase } from './application/use-cases/manage-payout-account.use-case';
import { ManageSellerStatusUseCase } from './application/use-cases/manage-seller-status.use-case';
import { ManageStoreProfileUseCase } from './application/use-cases/manage-store-profile.use-case';
import { ManageTeamMembersUseCase } from './application/use-cases/manage-team-members.use-case';
import { SyncSellerFromAuthEventUseCase } from './application/use-cases/sync-seller-from-auth-event.use-case';
import { PrismaSellerRepository } from './infrastructure/persistence/prisma-seller.repository';
import { SellerController } from './interfaces/http/seller.controller';
import { AccessTokenGuard } from './interfaces/http/guards/access-token.guard';
import { RolesGuard } from './interfaces/http/guards/roles.guard';
import { SellerEventsConsumer } from './interfaces/kafka/seller-events.consumer';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SellerController, SellerEventsConsumer],
  providers: [
    PrismaService,
    ManageApplicationUseCase,
    ManageDocumentsUseCase,
    ManageStoreProfileUseCase,
    ManagePayoutAccountUseCase,
    ManageTeamMembersUseCase,
    ManageFulfillmentSettingsUseCase,
    ManageSellerStatusUseCase,
    GetAccountHealthUseCase,
    SyncSellerFromAuthEventUseCase,
    AccessTokenGuard,
    RolesGuard,
    { provide: SELLER_REPOSITORY, useClass: PrismaSellerRepository }
  ]
})
export class SellerModule {}
