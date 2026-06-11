import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAccountHealthUseCase } from '../../application/use-cases/get-account-health.use-case';
import { ManageApplicationUseCase } from '../../application/use-cases/manage-application.use-case';
import { ManageDocumentsUseCase } from '../../application/use-cases/manage-documents.use-case';
import { ManageFulfillmentSettingsUseCase } from '../../application/use-cases/manage-fulfillment-settings.use-case';
import { ManagePayoutAccountUseCase } from '../../application/use-cases/manage-payout-account.use-case';
import { ManageSellerStatusUseCase } from '../../application/use-cases/manage-seller-status.use-case';
import { ManageStoreProfileUseCase } from '../../application/use-cases/manage-store-profile.use-case';
import { ManageTeamMembersUseCase } from '../../application/use-cases/manage-team-members.use-case';
import { SellerActor } from '../../domain/ports/seller.repository';
import { AuthenticatedRequest } from './authenticated-request';
import { SellerApplicationDto } from './dtos/application.dto';
import { SellerDocumentDto } from './dtos/document.dto';
import { FulfillmentSettingsDto } from './dtos/fulfillment-settings.dto';
import { PayoutAccountDto } from './dtos/payout-account.dto';
import { ChangeSellerStatusDto } from './dtos/status.dto';
import { StoreProfileDto } from './dtos/store-profile.dto';
import { TeamMemberDto, UpdateTeamMemberDto } from './dtos/team-member.dto';
import { mapSellerError } from './seller-error.mapper';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RequireRoles } from './guards/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('sellers')
@Controller()
export class SellerController {
  constructor(
    private readonly manageApplicationUseCase: ManageApplicationUseCase,
    private readonly manageDocumentsUseCase: ManageDocumentsUseCase,
    private readonly manageStoreProfileUseCase: ManageStoreProfileUseCase,
    private readonly managePayoutAccountUseCase: ManagePayoutAccountUseCase,
    private readonly manageTeamMembersUseCase: ManageTeamMembersUseCase,
    private readonly manageFulfillmentSettingsUseCase: ManageFulfillmentSettingsUseCase,
    private readonly manageSellerStatusUseCase: ManageSellerStatusUseCase,
    private readonly getAccountHealthUseCase: GetAccountHealthUseCase
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit seller application' })
  @ApiBody({ type: SellerApplicationDto })
  @UseGuards(AccessTokenGuard)
  @Post('sellers/me/application')
  submitApplication(@Req() request: AuthenticatedRequest, @Body() dto: SellerApplicationDto) {
    return this.handle(this.manageApplicationUseCase.submit(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read seller onboarding status' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/status')
  getStatus(@Req() request: AuthenticatedRequest) {
    return this.handle(this.manageApplicationUseCase.getStatus(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit seller KYC document metadata' })
  @ApiBody({ type: SellerDocumentDto })
  @UseGuards(AccessTokenGuard)
  @Post('sellers/me/kyc-documents')
  addDocument(@Req() request: AuthenticatedRequest, @Body() dto: SellerDocumentDto) {
    return this.handle(this.manageDocumentsUseCase.add(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List seller KYC documents' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/kyc-documents')
  listDocuments(@Req() request: AuthenticatedRequest) {
    return this.handle(this.manageDocumentsUseCase.list(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read seller store profile' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/store-profile')
  getStoreProfile(@Req() request: AuthenticatedRequest) {
    return this.handle(this.manageStoreProfileUseCase.get(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller store profile' })
  @ApiBody({ type: StoreProfileDto })
  @UseGuards(AccessTokenGuard)
  @Put('sellers/me/store-profile')
  updateStoreProfile(@Req() request: AuthenticatedRequest, @Body() dto: StoreProfileDto) {
    return this.handle(this.manageStoreProfileUseCase.update(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read seller payout account' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/payout-account')
  getPayoutAccount(@Req() request: AuthenticatedRequest) {
    return this.handle(this.managePayoutAccountUseCase.get(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller payout account' })
  @ApiBody({ type: PayoutAccountDto })
  @UseGuards(AccessTokenGuard)
  @Put('sellers/me/payout-account')
  updatePayoutAccount(@Req() request: AuthenticatedRequest, @Body() dto: PayoutAccountDto) {
    return this.handle(this.managePayoutAccountUseCase.update(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List seller team members' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/team-members')
  listTeamMembers(@Req() request: AuthenticatedRequest) {
    return this.handle(this.manageTeamMembersUseCase.list(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite or upsert seller team member' })
  @ApiBody({ type: TeamMemberDto })
  @UseGuards(AccessTokenGuard)
  @Post('sellers/me/team-members')
  inviteTeamMember(@Req() request: AuthenticatedRequest, @Body() dto: TeamMemberDto) {
    return this.handle(this.manageTeamMembersUseCase.invite(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller team member' })
  @ApiBody({ type: UpdateTeamMemberDto })
  @UseGuards(AccessTokenGuard)
  @Put('sellers/me/team-members/:memberId')
  updateTeamMember(@Req() request: AuthenticatedRequest, @Param('memberId') memberId: string, @Body() dto: UpdateTeamMemberDto) {
    return this.handle(this.manageTeamMembersUseCase.update(this.actor(request), memberId, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove seller team member' })
  @UseGuards(AccessTokenGuard)
  @Delete('sellers/me/team-members/:memberId')
  removeTeamMember(@Req() request: AuthenticatedRequest, @Param('memberId') memberId: string) {
    return this.handle(this.manageTeamMembersUseCase.remove(this.actor(request), memberId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read seller fulfillment settings' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/fulfillment-settings')
  getFulfillmentSettings(@Req() request: AuthenticatedRequest) {
    return this.handle(this.manageFulfillmentSettingsUseCase.get(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller fulfillment settings' })
  @ApiBody({ type: FulfillmentSettingsDto })
  @UseGuards(AccessTokenGuard)
  @Put('sellers/me/fulfillment-settings')
  updateFulfillmentSettings(@Req() request: AuthenticatedRequest, @Body() dto: FulfillmentSettingsDto) {
    return this.handle(this.manageFulfillmentSettingsUseCase.update(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read seller account health' })
  @UseGuards(AccessTokenGuard)
  @Get('sellers/me/account-health')
  getAccountHealth(@Req() request: AuthenticatedRequest) {
    return this.handle(this.getAccountHealthUseCase.execute(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List seller applications for admin review' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('ADMIN')
  @Get('admin/sellers/applications')
  listApplications() {
    return this.handle(this.manageSellerStatusUseCase.listApplications());
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change seller operational status' })
  @ApiBody({ type: ChangeSellerStatusDto })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('ADMIN')
  @Put('admin/sellers/:sellerId/status')
  changeStatus(@Req() request: AuthenticatedRequest, @Param('sellerId') sellerId: string, @Body() dto: ChangeSellerStatusDto) {
    return this.handle(
      this.manageSellerStatusUseCase.changeStatus({
        sellerId,
        toStatus: dto.toStatus,
        actorUserId: request.user.id,
        reason: dto.reason
      })
    );
  }

  private actor(request: AuthenticatedRequest): SellerActor {
    return {
      authUserId: request.user.id,
      email: request.user.email,
      roles: request.user.roles
    };
  }

  private async handle<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      mapSellerError(error);
    }
  }
}

