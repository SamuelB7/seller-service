import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SELLER_TEAM_MEMBER_STATUSES, SELLER_TEAM_ROLES, SellerTeamMemberStatus, SellerTeamRole } from '../../../domain/seller-types';

export class TeamMemberDto {
  @ApiPropertyOptional({ example: 'auth-user-id' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authUserId?: string;

  @ApiProperty({ example: 'operator@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Jane Operator' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ example: 'OPERATIONS', enum: SELLER_TEAM_ROLES })
  @IsIn(SELLER_TEAM_ROLES)
  role: SellerTeamRole;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ example: 'Jane Operator' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'MANAGER', enum: SELLER_TEAM_ROLES })
  @IsOptional()
  @IsIn(SELLER_TEAM_ROLES)
  role?: SellerTeamRole;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: SELLER_TEAM_MEMBER_STATUSES })
  @IsOptional()
  @IsIn(SELLER_TEAM_MEMBER_STATUSES)
  status?: SellerTeamMemberStatus;
}

